import re
import aiohttp
from typing import List, Dict, Any

try:
    import torch
    from sentence_transformers import SentenceTransformer, util
    from sklearn.feature_extraction.text import TfidfVectorizer
    from transformers import AutoTokenizer, AutoModelForCausalLM
    HEAVY_DEPS_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ Warning: Heavy ML dependencies not available: {e}")
    HEAVY_DEPS_AVAILABLE = False
    torch = None
    SentenceTransformer = None
    TfidfVectorizer = None
    AutoTokenizer = None
    AutoModelForCausalLM = None

class PlagiarismDetector:
    def __init__(self):
        print("🔍 Initialisation du Détecteur de Plagiat")
        
        self.model = None
        self.vectorizer = None
        self.ai_tokenizer = None
        self.ai_model = None
        self.has_ai_detector = False

        if HEAVY_DEPS_AVAILABLE:
            try:
                self.model = SentenceTransformer("all-MiniLM-L6-v2")
                print("✅ SentenceTransformer chargé")
            except Exception as e:
                print(f"❌ Erreur modèle sémantique : {e}")

            try:
                self.vectorizer = TfidfVectorizer(
                    ngram_range=(1, 3),
                    max_features=5000,
                    stop_words="english"
                )
            except Exception as e:
                print(f"❌ Erreur Vectorizer : {e}")

            try:
                self.ai_tokenizer = AutoTokenizer.from_pretrained("distilgpt2")
                self.ai_model = AutoModelForCausalLM.from_pretrained("distilgpt2")
                self.has_ai_detector = True
                print("✅ Détecteur IA chargé")
            except Exception as e:
                print(f"⚠ Détection IA désactivée : {e}")
        else:
             print("⚠️ Mode 'Léger' activé (Pas de ML/AI)")



        self.stats = {
            "semantic_checks": 0,
            "web_checks": 0,
            "matches_found": 0,
            "errors": 0
        }

        print("Ô£à D├®tecteur pr├¬t")

    def preprocess(self, text: str) -> str:
        text = text.lower()
        text = re.sub(r"[^\w\s├á-├┐]", " ", text)
        text = re.sub(r"\s+", " ", text)
        return text.strip()

    def calculate_similarity(self, text1: str, text2: str) -> float:
        if not self.model or not self.vectorizer or not HEAVY_DEPS_AVAILABLE:
            # Fallback: simple Jaccard similarity on sets of words
            words1, words2 = set(text1.lower().split()), set(text2.lower().split())
            if not words1 or not words2: return 0.0
            return len(words1 & words2) / len(words1 | words2)

        self.stats["semantic_checks"] += 1

        t1 = self.preprocess(text1[:800])
        t2 = self.preprocess(text2[:800])

        try:
            tfidf = self.vectorizer.fit_transform([t1, t2])
            tfidf_sim = (tfidf[0] @ tfidf[1].T).toarray()[0][0]
        except Exception:
            tfidf_sim = 0
        except Exception:
            tfidf_sim = 0

        try:
            emb = self.model.encode([t1, t2], convert_to_tensor=True)
            semantic_sim = util.cos_sim(emb[0], emb[1]).item()
        except Exception:
            semantic_sim = 0

        words1, words2 = set(t1.split()), set(t2.split())
        jaccard = len(words1 & words2) / len(words1 | words2) if words1 else 0

        return round(0.6 * semantic_sim + 0.3 * tfidf_sim + 0.1 * jaccard, 4)

    def calculate_ai_score(self, text: str) -> Dict[str, Any]:
        if not self.has_ai_detector or len(text.split()) < 100:
            return {"ai_score": 0, "risk": "none"}

        try:
            enc = self.ai_tokenizer(
                text[:1024], return_tensors="pt", truncation=True
            )
            with torch.no_grad():
                loss = self.ai_model(**enc, labels=enc["input_ids"]).loss
            perplexity = torch.exp(loss).item()
        except Exception:
            return {"ai_score": 0, "risk": "unknown"}

        score = 100 if perplexity < 30 else max(0, 100 - perplexity)
        risk = "high" if score > 70 else "medium" if score > 40 else "low"

        return {
            "ai_score": round(score, 2),
            "perplexity": round(perplexity, 2),
            "risk": risk
        }

    async def _search_semantic_scholar(
            self, query: str, session: aiohttp.ClientSession
    ) -> List[Dict]:
        self.stats["web_checks"] += 1
        url = "https://api.semanticscholar.org/graph/v1/paper/search"

        params = {
            "query": query[:200],
            "limit": 5,
            "fields": "title,abstract,url"
        }

        results = []

        try:
            async with session.get(url, params=params, timeout=15) as r:
                if r.status != 200:
                    return results

                data = await r.json()

                for paper in data.get("data", []):
                    abstract = paper.get("abstract")
                    if not abstract:
                        continue

                    sim = self.calculate_similarity(query, abstract)
                    if sim > 0.25:
                        results.append({
                            "title": paper.get("title"),
                            "url": paper.get("url"),
                            "similarity": sim,
                            "source": "Semantic Scholar"
                        })
                        self.stats["matches_found"] += 1

        except Exception:
            self.stats["errors"] += 1

        return results

    async def _search_crossref(
            self, query: str, session: aiohttp.ClientSession
    ) -> List[Dict]:
        url = "https://api.crossref.org/works"
        params = {"query": query[:200], "rows": 5}
        results = []

        try:
            async with session.get(url, params=params, timeout=15) as r:
                if r.status != 200:
                    return results

                items = (await r.json()).get("message", {}).get("items", [])

                for item in items:
                    title = " ".join(item.get("title", []))
                    sim = self.calculate_similarity(query, title)

                    if sim > 0.25:
                        results.append({
                            "title": title,
                            "url": item.get("URL"),
                            "similarity": sim,
                            "source": "CrossRef"
                        })
                        self.stats["matches_found"] += 1

        except Exception:
            self.stats["errors"] += 1

        return results

    async def check_web_source(
            self, text_chunk: str, session: aiohttp.ClientSession, chunk_index: int = -1
    ) -> List[Dict]:
        if len(text_chunk.strip()) < 50:
            return []

        results = []
        semantic_results = await self._search_semantic_scholar(text_chunk, session)
        crossref_results = await self._search_crossref(text_chunk, session)

        for res in semantic_results:
            res['chunk_index'] = chunk_index
            res['query_text'] = text_chunk[:500]
            res['matched_text'] = res.get('title', '')[:200]
            res['original_text'] = text_chunk[:200]
            res['score'] = round(res.get('similarity', 0) * 100, 2)

        for res in crossref_results:
            res['chunk_index'] = chunk_index
            res['query_text'] = text_chunk[:500]
            res['matched_text'] = res.get('title', '')[:200]
            res['original_text'] = text_chunk[:200]
            res['score'] = round(res.get('similarity', 0) * 100, 2)

        results = semantic_results + crossref_results

        unique = {}
        for r in results:
            if r.get("url"):
                if r["url"] not in unique or r["similarity"] > unique[r["url"]]["similarity"]:
                    unique[r["url"]] = r

        sorted_results = sorted(
            unique.values(),
            key=lambda x: x["similarity"],
            reverse=True
        )[:5]

        return sorted_results

    def get_stats(self) -> Dict:
        return self.stats.copy()

import asyncio
from app.models import Rapport, PlagiatAnalysis, PlagiatMatch, db
import os
import PyPDF2  # Ensure this is installed or use text extraction util

def extract_text_from_pdf(pdf_path):
    text = ""
    try:
        with open(pdf_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                text += page.extract_text() + "\n"
    except Exception as e:
        print(f"Error reading PDF: {e}")
    return text

def analyze_plagiarism(rapport_id):
    """
    Main service function to analyze a report for plagiarism.
    """
    rapport = Rapport.query.get(rapport_id)
    if not rapport:
        return {"error": "Report not found"}

    if not rapport.storage_path:
        return {"error": "Report file not found"}
        
    file_path = os.path.join(os.getcwd(), rapport.storage_path)
    if not os.path.exists(file_path):
        return {"error": "Physical file missing"}

    # Extract text (Simplistic approach)
    text = extract_text_from_pdf(file_path)
    if not text:
        return {"error": "Could not extract text from PDF"}

    detector = PlagiarismDetector()
    
    # Run async checks
    async def run_checks():
        async with aiohttp.ClientSession() as session:
            # Chunking (simplified)
            chunks = [text[i:i+1000] for i in range(0, len(text), 1000)]
            all_matches = []
            
            for i, chunk in enumerate(chunks[:5]): # Limit check to first 5 chunks for speed/demo
                matches = await detector.check_web_source(chunk, session, i)
                all_matches.extend(matches)
            return all_matches

    matches = asyncio.run(run_checks())
    
    # Calculate global score (simplified)
    # Average similarity of top matches? 
    # Or max similarity?
    max_sim = 0
    if matches:
        max_sim = max(m['score'] for m in matches)
    
    # AI Score
    ai_result = detector.calculate_ai_score(text[:1000]) # Check first 1000 chars

    # Save Analysis result to DB
    analysis = PlagiatAnalysis(
        rapport_id=rapport.id,
        similarity_score=max_sim,
        status="completed"
    )
    db.session.add(analysis)
    db.session.commit()

    # Save matches
    for m in matches:
        match = PlagiatMatch(
            analysis_id=analysis.id,
            source_url=m.get('url'),
            similarity=m.get('similarity'),
            content_snippet=m.get('matched_text')
        )
        db.session.add(match)
    db.session.commit()

    return {
        "student": rapport.author.name if rapport.author else "Unknown",
        "rapport": rapport.titre or "Untitled",
        "similarity": max_sim,
        "originality": 100 - max_sim,
        "risk": ai_result.get("risk", "low"),
        "ai_score": ai_result.get("ai_score", 0),
        "chunks_analyzed": 5, # Mock
        "chunks_with_matches": len(matches),
        "matches_saved": len(matches),
        "sources": [
            {
                "source": m.get('source', 'Web'),
                "similarity": m.get('score', 0),
                "url": m.get('url'),
                "text": m.get('original_text', '')[:50] + "...",
                "matched_text": m.get('matched_text', '')[:50] + "...",
                "page": 1
            }
            for m in matches
        ]
    }
