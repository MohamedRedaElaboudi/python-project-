import os
import re
import sys
import asyncio
import numpy as np
import aiohttp
from datetime import datetime
from typing import List, Dict
import pdfplumber
from sqlalchemy.exc import SQLAlchemyError

current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(os.path.dirname(current_dir))
sys.path.insert(0, root_dir)

from flask import Blueprint, jsonify, request
from ...models import db, Rapport, PlagiatAnalysis, PlagiatMatch, User

try:
    import docx
except ImportError:
    docx = None

try:
    from .plagiarism_detector import PlagiarismDetector

    detector = PlagiarismDetector()
except ImportError as e:
    detector = None

plagiat_analysis_bp = Blueprint("plagiat_analysis", __name__, url_prefix="/api/plagiat")


def extract_text_from_file(filepath: str) -> str:
    global root_dir

    if os.path.isabs(filepath) or ':' in filepath:
        match = re.search(r'(uploads[/\\][\s\S]+)', filepath, re.IGNORECASE)
        if match:
            relative_path = match.group(1)
            relative_path = relative_path.replace('/', os.path.sep).replace('\\', os.path.sep)
        else:
            relative_path = filepath
    else:
        relative_path = filepath.lstrip(os.path.sep)

    absolute_filepath = os.path.join(root_dir, relative_path)
    absolute_filepath = absolute_filepath.replace('/', os.path.sep).replace('\\', os.path.sep)

    if not os.path.exists(absolute_filepath):
        return ""

    try:
        if absolute_filepath.endswith('.pdf'):
            full_text = ""
            with pdfplumber.open(absolute_filepath) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        full_text += page_text + "\n"
            return full_text.strip()
        elif absolute_filepath.endswith('.docx'):
            if docx is None:
                raise ImportError("python-docx est requis pour les fichiers .docx")
            doc = docx.Document(absolute_filepath)
            paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
            return '\n'.join(paragraphs)
        elif absolute_filepath.endswith('.txt'):
            with open(absolute_filepath, 'r', encoding='utf-8') as f:
                return f.read().strip()
        else:
            return ""
    except Exception as e:
        import traceback
        return ""


def count_syllables(word: str) -> int:
    word = word.lower()
    vowels = "aeiouyàâéèêëîïôùûüÿ"
    count = 0
    prev_char_vowel = False
    for char in word:
        is_vowel = char in vowels
        if is_vowel and not prev_char_vowel:
            count += 1
        prev_char_vowel = is_vowel
    return max(1, count)


def calculate_text_stats(text: str) -> Dict:
    words = text.split()
    sentences = [s.strip() for s in re.split(r'[.!?]', text) if s.strip()]
    paragraphs = [p.strip() for p in text.split('\n') if p.strip()]
    unique_words = len(set(words))

    syllables = sum(count_syllables(word) for word in words) or 1
    words_count = len(words) or 1
    sentences_count = len(sentences) or 1
    readability = 206.835 - 1.015 * (words_count / sentences_count) - 84.6 * (syllables / words_count)
    readability = max(0, min(100, readability))

    return {
        "total_words": words_count,
        "total_characters": len(text),
        "total_sentences": sentences_count,
        "total_paragraphs": len(paragraphs),
        "unique_words": unique_words,
        "readability_score": round(readability, 2)
    }


def chunk_text_intelligently(text: str, max_chunks: int = 25) -> List[str]:
    chunks = []
    paragraphs = [p.strip() for p in text.split('\n') if p.strip()]

    for para in paragraphs:
        words = para.split()
        if len(words) <= 150:
            chunks.append(para)
        else:
            sentences = re.split(r'(?<=[.!?])\s+', para)
            current_chunk = []
            current_words = 0
            for sentence in sentences:
                sentence_words = sentence.split()
                if len(sentence_words) < 3:
                    continue
                if current_words + len(sentence_words) <= 100 and len(current_chunk) < 5:
                    current_chunk.append(sentence)
                    current_words += len(sentence_words)
                else:
                    if current_chunk:
                        chunks.append(' '.join(current_chunk))
                    current_chunk = [sentence]
                    current_words = len(sentence_words)
                if len(chunks) >= max_chunks:
                    break
            if current_chunk and len(chunks) < max_chunks:
                chunks.append(' '.join(current_chunk))
        if len(chunks) >= max_chunks:
            break

    if len(chunks) < 10:
        sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if s.strip() and len(s.split()) >= 5]
        for sentence in sentences:
            if len(chunks) >= max_chunks:
                break
            chunks.append(sentence)

    return chunks[:max_chunks]


async def analyze_single_rapport(rapport, student, analysis_obj: PlagiatAnalysis = None) -> Dict:
    if detector is None:
        raise RuntimeError("Le détecteur de plagiat n'a pas été initialisé.")

    try:
        text_content = extract_text_from_file(rapport.storage_path)

        if not text_content or len(text_content) < 50:
            return {
                "similarity": 0,
                "originality": 100,
                "risk": "none",
                "ai_score": 0,
                "sources": [],
                "note": "Document vide ou trop court (<50 caractères)",
                "chunks_analyzed": 0,
                "chunks_with_matches": 0
            }

        chunks = chunk_text_intelligently(text_content)
        all_matches_data = []

        if analysis_obj:
            try:
                PlagiatMatch.query.filter_by(analysis_id=analysis_obj.id).delete()
                db.session.flush()
            except Exception as e:
                pass

        async with aiohttp.ClientSession() as session:
            tasks = []
            for i, chunk in enumerate(chunks):
                if len(chunk.split()) >= 5:
                    tasks.append(detector.check_web_source(chunk, session, i))

            results = await asyncio.gather(*tasks, return_exceptions=True)

            matches_found_count = 0
            matches_saved_count = 0

            for i, sources in enumerate(results):
                if isinstance(sources, Exception):
                    continue

                if isinstance(sources, list) and sources:
                    matches_found_count += 1
                    for source in sources:
                        similarity = source.get('similarity', 0)
                        similarity_percent = round(similarity * 100, 2)

                        if similarity_percent > 5:
                            match_data = {
                                'text': source.get('query_text', chunks[i])[:500],
                                'source_url': source.get('url', ''),
                                'similarity': similarity_percent,
                                'score': source.get('score', 0),
                                'source': source.get('source', 'Web'),
                                'matched_text': source.get('matched_text', ''),
                                'original_text': source.get('original_text', ''),
                                'page': i + 1,
                                'chunk_index': i,
                            }
                            all_matches_data.append(match_data)

                            if analysis_obj:
                                try:
                                    match_obj = PlagiatMatch(
                                        analysis_id=analysis_obj.id,
                                        text=match_data['text'][:1000],
                                        source_url=match_data['source_url'][:500],
                                        source=match_data['source'][:100],
                                        score=match_data['score'],
                                        similarity=match_data['similarity'],
                                        matched_text=match_data['matched_text'][:1000],
                                        original_text=match_data['original_text'][:1000],
                                        page=match_data['page'],
                                        chunk_index=match_data['chunk_index']
                                    )
                                    db.session.add(match_obj)
                                    matches_saved_count += 1

                                    if matches_saved_count % 10 == 0:
                                        db.session.flush()

                                except Exception as e:
                                    db.session.rollback()

        if analysis_obj and matches_saved_count > 0:
            try:
                db.session.flush()
            except Exception as e:
                db.session.rollback()

        ai_result = detector.calculate_ai_score(text_content) if detector.has_ai_detector else {"ai_score": 0,
                                                                                                "risk": "none"}
        ai_score = ai_result.get('ai_score', 0)

        if all_matches_data:
            similarity_score = max(m['similarity'] for m in all_matches_data)
            avg_similarity = round(np.mean([m['similarity'] for m in all_matches_data]), 2)
        else:
            similarity_score = 0
            avg_similarity = 0

        originality_score = round(100 - similarity_score, 2)

        if similarity_score > 60 or ai_score > 70:
            risk = "high"
        elif similarity_score > 30 or ai_score > 40:
            risk = "medium"
        elif similarity_score > 15 or ai_score > 20:
            risk = "low"
        else:
            risk = "none"

        text_stats = calculate_text_stats(text_content)

        return {
            "student": student.name,
            "rapport": rapport.filename,
            "similarity": similarity_score,
            "originality": originality_score,
            "risk": risk,
            "sources": all_matches_data,
            "ai_score": round(ai_score, 2),
            "chunks_analyzed": len(chunks),
            "chunks_with_matches": matches_found_count,
            "avg_similarity": avg_similarity,
            "matches_saved": matches_saved_count,
            # Stats textuelles
            "word_count": text_stats.get("total_words", 0),
            "unique_words": text_stats.get("unique_words", 0),
            "character_count": text_stats.get("total_characters", 0),
            "paragraph_count": text_stats.get("total_paragraphs", 0),
            "readability_score": text_stats.get("readability_score", 0)
        }

    except Exception as e:
        import traceback
        return {
            "student": student.name,
            "rapport": rapport.filename,
            "similarity": 0,
            "originality": 100,
            "risk": "none",
            "sources": [],
            "ai_score": 0,
            "error": str(e),
            "chunks_analyzed": 0,
            "chunks_with_matches": 0
        }


@plagiat_analysis_bp.route("/analyze_all", methods=["POST"])
def analyze_all_reports():
    try:
        rapports = Rapport.query.all()
        results = []

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        db.session.begin_nested()

        for rapport in rapports:
            student = User.query.get(rapport.auteur_id)
            if not student:
                continue

            analysis = PlagiatAnalysis.query.filter_by(rapport_id=rapport.id).first()
            if not analysis:
                analysis = PlagiatAnalysis(rapport_id=rapport.id)
                db.session.add(analysis)
                db.session.flush()

            res = loop.run_until_complete(analyze_single_rapport(rapport, student, analysis_obj=analysis))
            results.append(res)

            analysis.similarity_score = res["similarity"]
            analysis.originality_score = res["originality"]
            analysis.risk_level = res["risk"]
            analysis.total_matches = len(res.get("sources", []))
            analysis.sources_count = len(res.get("sources", []))
            analysis.status = "completed"
            analysis.analyzed_at = datetime.utcnow()
            analysis.ai_score = res.get("ai_score", 0)
            analysis.chunks_analyzed = res.get("chunks_analyzed", 0)
            analysis.chunks_with_matches = res.get("chunks_with_matches", 0)
            # Save detailed stats
            analysis.word_count = res.get("word_count", 0)
            analysis.unique_words = res.get("unique_words", 0)
            analysis.character_count = res.get("character_count", 0)
            analysis.paragraph_count = res.get("paragraph_count", 0)
            analysis.readability_score = res.get("readability_score", 0)
            analysis.chunks_with_matches = res.get("chunks_with_matches", 0)

        db.session.commit()

        successful = [r for r in results if 'error' not in r]
        avg_similarity = round(np.mean([r['similarity'] for r in successful]) if successful else 0, 2)
        avg_originality = round(np.mean([r['originality'] for r in successful]) if successful else 100, 2)

        return jsonify({
            "results": results,
            "statistics": {
                "total_rapports": len(rapports),
                "analyses_reussies": len(successful),
                "average_similarity": avg_similarity,
                "average_originality": avg_originality
            },
            "status": "completed"
        })

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify(
            {"error": "Erreur de base de données lors de l'analyse multiple: " + str(e), "status": "error"}), 500
    except Exception as e:
        import traceback
        return jsonify({"error": str(e), "status": "error"}), 500


@plagiat_analysis_bp.route("/analyze/<int:rapport_id>", methods=["POST"])
def analyze_single(rapport_id):
    try:
        rapport = Rapport.query.get_or_404(rapport_id)
        student = User.query.get(rapport.auteur_id)

        if not student:
            return jsonify({"error": "Étudiant non trouvé", "status": "error"}), 404

        analysis = PlagiatAnalysis.query.filter_by(rapport_id=rapport.id).first()

        if analysis and analysis.status == "completed" and analysis.analyzed_at is not None:
            formatted_date = analysis.analyzed_at.strftime('%Y-%m-%d %H:%M:%S')

            return jsonify({
                "analysis": {
                    "similarity": analysis.similarity_score,
                    "originality": analysis.originality_score,
                    "risk": analysis.risk_level,
                    "rapport": rapport.filename,
                    "student": student.name
                },
                "status": "already_completed",
                "message": f"Rapport déjà analysé ({formatted_date}).",
                "analysis_id": analysis.id
            })

        if analysis:
            try:
                PlagiatMatch.query.filter_by(analysis_id=analysis.id).delete()
                db.session.flush()
            except Exception as e:
                db.session.rollback()
        else:
            analysis = PlagiatAnalysis(rapport_id=rapport.id)
            db.session.add(analysis)

        db.session.flush()

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        result = loop.run_until_complete(analyze_single_rapport(rapport, student, analysis_obj=analysis))

        matches_count = len(result.get("sources", []))

        analysis.similarity_score = result["similarity"]
        analysis.originality_score = result["originality"]
        analysis.risk_level = result["risk"]
        analysis.total_matches = matches_count
        analysis.sources_count = matches_count
        analysis.status = "completed"
        analysis.analyzed_at = datetime.utcnow()
        analysis.ai_score = result.get("ai_score", 0)
        analysis.chunks_analyzed = result.get("chunks_analyzed", 0)
        analysis.chunks_with_matches = result.get("chunks_with_matches", 0)
        # Save detailed stats
        analysis.word_count = result.get("word_count", 0)
        analysis.unique_words = result.get("unique_words", 0)
        analysis.character_count = result.get("character_count", 0)
        analysis.paragraph_count = result.get("paragraph_count", 0)
        analysis.readability_score = result.get("readability_score", 0)

        saved_matches = PlagiatMatch.query.filter_by(analysis_id=analysis.id).count()

        db.session.commit()

        return jsonify({
            "analysis": result,
            "status": "completed",
            "matches_saved": saved_matches,
            "analysis_id": analysis.id
        })

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Erreur de base de données: " + str(e), "status": "error"}), 500
    except Exception as e:
        import traceback
        return jsonify({"error": str(e), "status": "error"}), 500


@plagiat_analysis_bp.route("/analysis/<int:analysis_id>", methods=["GET"])
def get_analysis(analysis_id):
    try:
        analysis = PlagiatAnalysis.query.get_or_404(analysis_id)
        rapport = Rapport.query.get(analysis.rapport_id)
        if not rapport:
            return jsonify({"error": "Rapport non trouvé", "status": "error"}), 404

        student = User.query.get(rapport.auteur_id)
        if not student:
            return jsonify({"error": "Étudiant non trouvé", "status": "error"}), 404

        matches = PlagiatMatch.query.filter_by(analysis_id=analysis.id).order_by(PlagiatMatch.similarity.desc()).all()

        sources = []
        total_similarity = 0

        for match in matches:
            source_data = {
                'chunk_index': match.chunk_index or 0,
                'matched_text': match.matched_text or '',
                'original_text': match.original_text or '',
                'page': match.page or 0,
                'score': match.score or 0,
                'similarity': match.similarity or 0,
                'source': match.source or 'Inconnu',
                'source_url': match.source_url or '',
                'text': match.text or ''
            }
            sources.append(source_data)
            total_similarity += match.similarity or 0

        avg_similarity = total_similarity / len(sources) if sources else 0

        text_content = extract_text_from_file(rapport.storage_path)
        text_stats = calculate_text_stats(text_content) if text_content else {}

        response = {
            'analysis': {
                'student': student.name,
                'rapport': rapport.filename,
                'similarity': analysis.similarity_score or 0,
                'originality': analysis.originality_score or 100,
                'risk': analysis.risk_level or 'none',
                'sources': sources,
                'ai_score': analysis.ai_score or 0,
                'chunks_analyzed': analysis.chunks_analyzed or 0,
                'chunks_with_matches': analysis.chunks_with_matches or 0,
                'avg_similarity': round(avg_similarity, 2),
                'total_matches': len(sources),
                'total_words': text_stats.get('total_words', 0),
                'total_characters': text_stats.get('total_characters', 0),
                'total_sentences': text_stats.get('total_sentences', 0),
                'total_paragraphs': text_stats.get('total_paragraphs', 0),
                'unique_words': text_stats.get('unique_words', 0),
                'readability_score': text_stats.get('readability_score', 0),
                'storage_path': rapport.storage_path
            },
            'analysis_id': analysis.id,
            'rapport_id': rapport.id,
            'student_id': student.id,
            'matches_saved': len(sources),
            'status': analysis.status or 'completed',
            'analyzed_at': analysis.analyzed_at.isoformat() if analysis.analyzed_at else None,
            'created_at': analysis.created_at.isoformat() if hasattr(analysis,
                                                                     'created_at') and analysis.created_at else None
        }

        return jsonify(response)

    except Exception as e:
        import traceback
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500


@plagiat_analysis_bp.route("/analyses", methods=["GET"])
def get_all_analyses():
    try:
        analyses = PlagiatAnalysis.query.order_by(PlagiatAnalysis.analyzed_at.desc()).all()
        results = []

        for analysis in analyses:
            rapport = Rapport.query.get(analysis.rapport_id)
            student = User.query.get(rapport.auteur_id) if rapport else None

            matches_count = PlagiatMatch.query.filter_by(analysis_id=analysis.id).count()

            result = {
                'id': analysis.id,
                'rapport_id': analysis.rapport_id,
                'rapport_name': rapport.filename if rapport else 'Document inconnu',
                'student_name': student.name if student else 'Étudiant inconnu',
                'student_id': student.id if student else None,
                'similarity': analysis.similarity_score or 0,
                'originality': analysis.originality_score or 100,
                'risk': analysis.risk_level or 'none',
                'ai_score': analysis.ai_score or 0,
                'status': analysis.status or 'unknown',
                'analyzed_at': analysis.analyzed_at.isoformat() if analysis.analyzed_at else None,
                'total_matches': matches_count,
                'chunks_analyzed': analysis.chunks_analyzed or 0,
                'chunks_with_matches': analysis.chunks_with_matches or 0
            }
            results.append(result)

        return jsonify({
            'analyses': results,
            'count': len(results),
            'status': 'success'
        })

    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500


@plagiat_analysis_bp.route("/pending_analyses", methods=["GET"])
def get_pending_analyses():
    try:
        all_rapports = Rapport.query.all()
        pending_rapports = []

        for rapport in all_rapports:
            analysis = PlagiatAnalysis.query.filter_by(rapport_id=rapport.id).first()

            if not analysis:
                student = User.query.get(rapport.auteur_id)
                if student:
                    pending_rapports.append({
                        'rapport_id': rapport.id,
                        'filename': rapport.filename,
                        'student_id': student.id,
                        'student_name': student.name,
                        'storage_path': rapport.storage_path,
                        'created_at': rapport.created_at.isoformat() if rapport.created_at else None
                    })

        return jsonify({
            'pending_analyses': pending_rapports,
            'count': len(pending_rapports),
            'status': 'success'
        })

    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500


@plagiat_analysis_bp.route("/analyze_selected", methods=["POST"])
def analyze_selected_reports():
    try:
        data = request.get_json()
        rapport_ids = data.get('rapport_ids', [])

        if not rapport_ids:
            return jsonify({"error": "Aucun rapport sélectionné", "status": "error"}), 400

        results = []
        processed_count = 0

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        db.session.begin_nested()

        for rapport_id in rapport_ids:
            rapport = Rapport.query.get(rapport_id)
            if not rapport:
                continue

            student = User.query.get(rapport.auteur_id)
            if not student:
                continue

            analysis = PlagiatAnalysis.query.filter_by(rapport_id=rapport.id).first()
            if not analysis:
                analysis = PlagiatAnalysis(rapport_id=rapport.id)
                db.session.add(analysis)
                db.session.flush()

            res = loop.run_until_complete(analyze_single_rapport(rapport, student, analysis_obj=analysis))
            results.append({
                'rapport_id': rapport.id,
                'filename': rapport.filename,
                'student_name': student.name,
                'result': res
            })

            analysis.similarity_score = res.get("similarity", 0)
            analysis.originality_score = res.get("originality", 100)
            analysis.risk_level = res.get("risk", "none")
            analysis.total_matches = len(res.get("sources", []))
            analysis.sources_count = len(res.get("sources", []))
            analysis.status = "completed"
            analysis.analyzed_at = datetime.utcnow()
            analysis.ai_score = res.get("ai_score", 0)
            analysis.chunks_analyzed = res.get("chunks_analyzed", 0)
            analysis.chunks_with_matches = res.get("chunks_with_matches", 0)

            processed_count += 1

        db.session.commit()

        return jsonify({
            "results": results,
            "processed_count": processed_count,
            "total_selected": len(rapport_ids),
            "status": "completed",
            "message": f"{processed_count} rapports analysés avec succès"
        })

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Erreur de base de données: " + str(e), "status": "error"}), 500
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e), "status": "error"}), 500


@plagiat_analysis_bp.route("/analyze_all_pending", methods=["POST"])
def analyze_all_pending_reports():
    try:
        all_rapports = Rapport.query.all()
        pending_rapports = []

        for rapport in all_rapports:
            analysis = PlagiatAnalysis.query.filter_by(rapport_id=rapport.id).first()
            if not analysis:
                pending_rapports.append(rapport)

        if not pending_rapports:
            return jsonify({
                "message": "Tous les rapports ont déjà été analysés",
                "status": "no_action",
                "pending_count": 0
            })

        results = []
        processed_count = 0

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        db.session.begin_nested()

        for rapport in pending_rapports:
            student = User.query.get(rapport.auteur_id)
            if not student:
                continue

            analysis = PlagiatAnalysis(rapport_id=rapport.id)
            db.session.add(analysis)
            db.session.flush()

            res = loop.run_until_complete(analyze_single_rapport(rapport, student, analysis_obj=analysis))
            results.append({
                'rapport_id': rapport.id,
                'filename': rapport.filename,
                'student_name': student.name,
                'result': res
            })

            analysis.similarity_score = res.get("similarity", 0)
            analysis.originality_score = res.get("originality", 100)
            analysis.risk_level = res.get("risk", "none")
            analysis.total_matches = len(res.get("sources", []))
            analysis.sources_count = len(res.get("sources", []))
            analysis.status = "completed"
            analysis.analyzed_at = datetime.utcnow()
            analysis.ai_score = res.get("ai_score", 0)
            analysis.chunks_analyzed = res.get("chunks_analyzed", 0)
            analysis.chunks_with_matches = res.get("chunks_with_matches", 0)
            # Save detailed text stats
            analysis.word_count = res.get("word_count", 0)
            analysis.unique_words = res.get("unique_words", 0)
            analysis.character_count = res.get("character_count", 0)
            analysis.paragraph_count = res.get("paragraph_count", 0)
            analysis.readability_score = res.get("readability_score", 0)

            processed_count += 1

        db.session.commit()

        return jsonify({
            "results": results,
            "processed_count": processed_count,
            "total_pending": len(pending_rapports),
            "status": "completed",
            "message": f"{processed_count} rapports analysés automatiquement"
        })

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Erreur de base de données: " + str(e), "status": "error"}), 500
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e), "status": "error"}), 500


@plagiat_analysis_bp.route("/overview", methods=["GET"])
def get_overview():
    try:
        total_analyses = PlagiatAnalysis.query.count()

        analyses = PlagiatAnalysis.query.all()
        if analyses:
            originalite_moyenne = round(sum(a.originality_score or 0 for a in analyses) / len(analyses), 1)
        else:
            originalite_moyenne = 0

        high_risk = PlagiatAnalysis.query.filter(PlagiatAnalysis.risk_level == 'high').count()
        medium_risk = PlagiatAnalysis.query.filter(PlagiatAnalysis.risk_level == 'medium').count()
        low_risk = PlagiatAnalysis.query.filter(PlagiatAnalysis.risk_level.in_(['low', 'none'])).count()

        today = datetime.utcnow().date()
        analyses_today = PlagiatAnalysis.query.filter(
            db.func.date(PlagiatAnalysis.analyzed_at) == today
        ).count()

        recent_analyses = []
        for analysis in PlagiatAnalysis.query.order_by(PlagiatAnalysis.analyzed_at.desc()).limit(8).all():
            rapport = Rapport.query.get(analysis.rapport_id)
            student = User.query.get(rapport.auteur_id) if rapport else None

            if rapport and student:
                recent_analyses.append({
                    'id': analysis.id,
                    'rapport_id': rapport.id,
                    'prenom': student.prenom if hasattr(student, 'prenom') else '',
                    'name': student.name,
                    'filename': rapport.filename,
                    'similarity_score': analysis.similarity_score or 0,
                    'originality_score': analysis.originality_score or 100,
                    'risk': analysis.risk_level or 'none',
                    'ai_score': analysis.ai_score or 0,
                    'date': analysis.analyzed_at.strftime('%d/%m/%Y') if analysis.analyzed_at else '',
                    'time': analysis.analyzed_at.strftime('%H:%M') if analysis.analyzed_at else '',
                    'analyzed_at': analysis.analyzed_at.isoformat() if analysis.analyzed_at else None
                })

        return jsonify({
            'stats': {
                'rapports_analyses': total_analyses,
                'originalite_moyenne': originalite_moyenne,
                'risques_detectes': high_risk + medium_risk,
                'analyses_aujourdhui': analyses_today,
                'risque_eleve': high_risk,
                'risque_moyen': medium_risk,
                'risque_faible': low_risk
            },
            'recent_analyses': recent_analyses,
            'status': 'success'
        })

    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500


@plagiat_analysis_bp.route("/stats", methods=["GET"])
def get_detector_stats():
    if detector:
        return jsonify({
            "detector_stats": detector.get_stats(),
            "version": "2.0",
            "status": "active"
        })
    return jsonify({
        "detector_stats": "N/A",
        "version": "2.0",
        "status": "inactive (detector initialization failed)"
    })


@plagiat_analysis_bp.route("/test_match_save", methods=["GET"])
def test_match_save():
    try:
        test_analysis = PlagiatAnalysis(
            rapport_id=1,
            similarity_score=0,
            originality_score=100,
            risk_level="none",
            status="test"
        )
        db.session.add(test_analysis)
        db.session.flush()

        test_match = PlagiatMatch(
            analysis_id=test_analysis.id,
            text="Texte de test",
            source_url="https://example.com",
            source="Test",
            score=50.0,
            similarity=25.5,
            matched_text="Texte correspondant",
            original_text="Texte original",
            page=1,
            chunk_index=0
        )
        db.session.add(test_match)
        db.session.commit()

        return jsonify({
            "success": True,
            "analysis_id": test_analysis.id,
            "match_id": test_match.id,
            "message": "Test d'enregistrement réussi"
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500