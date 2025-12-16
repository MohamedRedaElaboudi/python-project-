from flask import Blueprint, jsonify
from sqlalchemy import func
from datetime import date
from ...models import db, User, Rapport, PlagiatAnalysis

plagiat_overview_bp = Blueprint(
    "plagiat_overview",
    __name__,
    url_prefix="/api/plagiat"
)


def risk_fr(risk):
    return {
        "low": "Faible",
        "medium": "Moyen",
        "high": "Élevé",
        "none": "Faible"
    }.get(str(risk).lower(), "Inconnu")


@plagiat_overview_bp.route("/overview", methods=["GET"])
def plagiat_overview():
    base_completed_query = PlagiatAnalysis.query.filter(PlagiatAnalysis.status == "completed")

    total_analyses = base_completed_query.count()

    avg_originality = db.session.query(
        func.avg(PlagiatAnalysis.originality_score)
    ).filter(
        PlagiatAnalysis.status == "completed"
    ).scalar() or 0

    risks_detected = base_completed_query.filter(
        PlagiatAnalysis.risk_level.in_(["medium", "high"])
    ).count()

    today_analyses = base_completed_query.filter(
        func.date(PlagiatAnalysis.analyzed_at) == date.today()
    ).count()

    recent = (
        db.session.query(
            PlagiatAnalysis,
            Rapport,
            User
        )
        .join(Rapport, PlagiatAnalysis.rapport_id == Rapport.id)
        .join(User, Rapport.auteur_id == User.id)
        .filter(PlagiatAnalysis.status == "completed")
        .filter(PlagiatAnalysis.analyzed_at.isnot(None))
        .order_by(PlagiatAnalysis.analyzed_at.desc())
        .limit(8)
        .all()
    )

    recent_analyses = []
    for analysis, rapport, user in recent:
        date_str = analysis.analyzed_at.strftime("%d %b") if analysis.analyzed_at else "N/A"
        time_str = analysis.analyzed_at.strftime("%H:%M") if analysis.analyzed_at else "N/A"

        recent_analyses.append({
            "id": analysis.id,
            "prenom": user.prenom,
            "name": user.name,
            "similarity_score": analysis.similarity_score or 0,
            "risk": risk_fr(analysis.risk_level),
            "date": date_str,
            "time": time_str,
        })

    return jsonify({
        "stats": {
            "rapports_analyses": total_analyses,
            "originalite_moyenne": round(avg_originality, 2),
            "risques_detectes": risks_detected,
            "analyses_aujourdhui": today_analyses,
        },
        "recent_analyses": recent_analyses
    }), 200