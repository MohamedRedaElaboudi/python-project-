from flask import Blueprint, jsonify
from sqlalchemy.orm import joinedload
from ...models import db, User, Rapport, PlagiatAnalysis, Student, PlagiatMatch

plagiat_dashboard_bp = Blueprint("plagiat_dashboard", __name__, url_prefix="/api/plagiat")

@plagiat_dashboard_bp.route("/dashboard", methods=["GET"])
def dashboard_plagiat():
    # Start from Rapport to get ALL reports, even those without analysis
    results = (
        db.session.query(
            Rapport,
            User,
            Student,
            PlagiatAnalysis
        )
        .join(User, User.id == Rapport.auteur_id)
        .outerjoin(Student, Student.user_id == User.id)
        .outerjoin(PlagiatAnalysis, PlagiatAnalysis.rapport_id == Rapport.id)
        .all()
    )

    data = []
    
    try:
        for rapport, user, student_info, analysis in results:

            user_prenom = user.prenom if user else "N/A"
            user_name = user.name if user else "Inconnu"

            student_matricule = getattr(student_info, 'cne', 'N/A')
            student_specialty = getattr(student_info, 'filiere', '--')
            student_level = getattr(student_info, 'niveau', '--')

            # Default values if no analysis exists
            analysis_id = None
            similarity_score = 0
            originality_score = 100
            risk_level = "none"
            total_matches = 0
            sources_count = 0
            status = "pending"
            analyzed_at = None
            
            # If analysis exists, use its values
            if analysis:
                analysis_id = analysis.id
                similarity_score = analysis.similarity_score or 0
                originality_score = analysis.originality_score or 100
                risk_level = analysis.risk_level
                total_matches = analysis.total_matches
                sources_count = analysis.sources_count
                status = analysis.status
                analyzed_at = analysis.analyzed_at

            # Fetch Jury via Rapport -> Soutenance -> Juries
            jury_names = []
            if rapport and rapport.soutenance:
                 # Check if soutenance is a list (backref behavior) or single object
                 soutenance_obj = rapport.soutenance[0] if isinstance(rapport.soutenance, list) and rapport.soutenance else rapport.soutenance
                 
                 # If it's a list but empty, soutenance_obj will be [] (falsey) if we didn't check, 
                 # but the list check handles it. 
                 # If it's not a list, it's the object itself.
                 # Wait, if it IS a list, we need the first item.
                 if isinstance(rapport.soutenance, list):
                     soutenance_obj = rapport.soutenance[0] if rapport.soutenance else None
                 else:
                     soutenance_obj = rapport.soutenance

                 if soutenance_obj and hasattr(soutenance_obj, 'juries'):
                     for j in soutenance_obj.juries:
                         if j.teacher:
                             jury_names.append(f"{j.teacher.name} ({j.role})")
            
            data.append({
                "id": analysis_id,  # Can be None for reports without analysis
                "rapportId": rapport.id,  # Always present
                "studentId": user.id if user else None,
                "studentName": user_name,
                "studentPrenom": user_prenom,
                "studentMatricule": student_matricule,
                "specialty": student_specialty,
                "level": student_level,
                "rapportName": rapport.filename if rapport else "Non lié",
                "similarityScore": int(similarity_score),
                "originalityScore": int(originality_score),
                "riskLevel": risk_level,
                "totalMatches": total_matches,
                "sourcesCount": sources_count,
                "status": status,
                "analyzedAt": analyzed_at.isoformat() if analyzed_at else None,
                "juryAssigned": jury_names # List of strings
            })

        return jsonify(data)
    except Exception as e:
        print(f"Error in dashboard_plagiat: {e}")
        return jsonify({"message": "Server error fetching plagiarism data"}), 500

@plagiat_dashboard_bp.route("/analysis/<int:analysis_id>", methods=["GET"])
def get_analysis_details(analysis_id):
    try:
        analysis = (
            db.session.query(PlagiatAnalysis)
            .options(
                joinedload(PlagiatAnalysis.rapport).joinedload(Rapport.author).joinedload(User.student_profile), # Use student_profile per User model
                joinedload(PlagiatAnalysis.matches),
            )
            .filter(PlagiatAnalysis.id == analysis_id)
            .first()
        )

        if not analysis:
            return jsonify({"message": f"Analyse de plagiat (ID: {analysis_id}) non trouvée"}), 404

        rapport = analysis.rapport
        user = rapport.author if rapport else None
        student_info = user.student_profile if user else None # user.student_profile per User model

        match_details = []
        for match in analysis.matches:
            match_details.append({
                "matchId": match.id,
                "text": match.text,
                "sourceUrl": match.source_url,
                "source": match.source,
                "score": match.score,
                "similarity": match.similarity,
                "matchedText": match.matched_text,
                "originalText": match.original_text,
                "page": match.page,
                "chunkIndex": match.chunk_index,
                "createdAt": None, # PlagiatMatch likely doesn't have created_at based on models.py
            })

        # Fetch Jury via Rapport -> Soutenance -> Juries
        jury_names = []
        if rapport and rapport.soutenance:
             if isinstance(rapport.soutenance, list):
                 soutenance_obj = rapport.soutenance[0] if rapport.soutenance else None
             else:
                 soutenance_obj = rapport.soutenance

             if soutenance_obj and hasattr(soutenance_obj, 'juries'):
                 for j in soutenance_obj.juries:
                     if j.teacher:
                         jury_names.append(f"{j.teacher.name} ({j.role})")

        data = {
            "id": analysis.id,
            "similarityScore": analysis.similarity_score,
            "originalityScore": analysis.originality_score,
            "riskLevel": analysis.risk_level,
            "status": analysis.status,
            "analyzedAt": analysis.analyzed_at.isoformat() if analysis.analyzed_at else None,
            "warnings": getattr(analysis, 'warnings', None),
            "recommendations": getattr(analysis, 'recommendations', None),
            "aiScore": analysis.ai_score,
            "totalMatches": analysis.total_matches,
            "sourcesCount": analysis.sources_count,
            "chunksAnalyzed": analysis.chunks_analyzed,
            "chunksWithMatches": analysis.chunks_with_matches,
            "wordCount": analysis.word_count,
            "uniqueWords": analysis.unique_words,
            "readabilityScore": analysis.readability_score,
            "characterCount": analysis.character_count,
            "paragraphCount": analysis.paragraph_count,

            "rapportInfo": {
                "rapportId": rapport.id if rapport else None,
                "filename": rapport.filename if rapport else "N/A",
                "storagePath": rapport.storage_path if rapport else "N/A",
                "createdAt": rapport.created_at.isoformat() if rapport else None,
            },

            "studentInfo": {
                "userId": user.id if user else None,
                "prenom": user.prenom if user else "N/A",
                "name": user.name if user else "N/A",
                "email": user.email if user else "N/A",
                "matricule": getattr(student_info, 'cne', 'N/A'),
                "cin": getattr(student_info, 'cin', 'N/A'),
                "tel": getattr(student_info, 'tel', 'N/A'),
                "specialty": getattr(student_info, 'filiere', 'N/A'),
                "level": getattr(student_info, 'niveau', 'N/A'),
            },

            "juryAssigned": jury_names, # List of strings
            "matches": match_details
        }

        return jsonify(data)
    except Exception as e:
        print(f"Error in get_analysis_details: {e}")
        return jsonify({"message": f"Server error: {str(e)}"}), 500