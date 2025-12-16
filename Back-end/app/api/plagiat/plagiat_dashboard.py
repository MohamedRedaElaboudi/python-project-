from flask import Blueprint, jsonify
from sqlalchemy.orm import joinedload
from ...models import db, User, Rapport, PlagiatAnalysis, Student, PlagiatMatch

plagiat_dashboard_bp = Blueprint("plagiat_dashboard", __name__, url_prefix="/api/plagiat")

@plagiat_dashboard_bp.route("/dashboard", methods=["GET"])
def dashboard_plagiat():
    results = (
        db.session.query(
            PlagiatAnalysis,
            Rapport,
            User,
            Student
        )
        .outerjoin(Rapport, Rapport.id == PlagiatAnalysis.rapport_id)
        .outerjoin(User, User.id == Rapport.auteur_id)
        .outerjoin(Student, Student.user_id == User.id)
        .all()
    )

    data = []

    for analysis, rapport, user, student_info in results:

        user_prenom = user.prenom if user else "N/A"
        user_name = user.name if user else "Inconnu"

        student_matricule = getattr(student_info, 'cne', 'N/A')
        student_specialty = getattr(student_info, 'filiere', '--')
        student_level = getattr(student_info, 'niveau', '--')

        data.append({
            "id": analysis.id,
            "studentId": user.id if user else None,
            "studentName": user_name,
            "studentPrenom": user_prenom,
            "studentMatricule": student_matricule,
            "specialty": student_specialty,
            "level": student_level,
            "rapportName": rapport.filename if rapport else "Non lié",
            "similarityScore": int(analysis.similarity_score or 0),
            "originalityScore": int(analysis.originality_score or 0),
            "riskLevel": analysis.risk_level,
            "totalMatches": analysis.total_matches,
            "sourcesCount": analysis.sources_count,
            "status": analysis.status,
            "analyzedAt": analysis.analyzed_at.isoformat() if analysis.analyzed_at else None,
            "juryAssigned": analysis.jury_assigned or "Non assigné"
        })

    return jsonify(data)


@plagiat_dashboard_bp.route("/analysis/<int:analysis_id>", methods=["GET"])
def get_analysis_details(analysis_id):
    analysis = (
        db.session.query(PlagiatAnalysis)
        .options(
            joinedload(PlagiatAnalysis.rapport).joinedload(Rapport.author).joinedload(User.student),
            joinedload(PlagiatAnalysis.matches),
        )
        .filter(PlagiatAnalysis.id == analysis_id)
        .first()
    )

    if not analysis:
        return jsonify({"message": f"Analyse de plagiat (ID: {analysis_id}) non trouvée"}), 404

    rapport = analysis.rapport
    user = rapport.author if rapport else None
    student_info = user.student if user else None

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
            "createdAt": match.created_at.isoformat() if match.created_at else None,
        })

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

        "juryAssigned": analysis.jury_assigned,
        "matches": match_details
    }

    return jsonify(data)