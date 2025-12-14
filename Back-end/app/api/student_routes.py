from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..utils.security import student_only

from ..dao.rapport_dao import RapportDAO
from ..dao.soutenance_dao import SoutenanceDAO

student_bp = Blueprint(
    "student",
    __name__,
    url_prefix="/api/v1/student"
)

# ===============================
# 📊 DASHBOARD
# ===============================
@student_bp.route("/dashboard", methods=["GET"])
@jwt_required()
@student_only
def dashboard():
    student_id = int(get_jwt_identity())

    rapport = RapportDAO.get_latest_by_student(student_id)
    soutenance = SoutenanceDAO.get_by_student(student_id)

    return jsonify({
        "rapport": dict(rapport) if rapport else None,
        "soutenance": soutenance.to_dict() if soutenance else None
    })


# ===============================
# 📂 MES RAPPORTS
# ===============================
@student_bp.route("/rapports", methods=["GET"])
@jwt_required()
@student_only
def mes_rapports():
    student_id = int(get_jwt_identity())

    rapports = RapportDAO.get_all_by_student(student_id)
    return jsonify([dict(r) for r in rapports])


# ===============================
# 🎓 SOUTENANCE ÉTUDIANT
# ===============================
@student_bp.route("/soutenance", methods=["GET"])
@jwt_required()
@student_only
def student_soutenance():
    student_id = int(get_jwt_identity())

    soutenance = SoutenanceDAO.get_by_student(student_id)

    if not soutenance:
        return jsonify(None), 200

    return jsonify({
        # 🔹 date + heure combinées pour le frontend
        "date_debut": f"{soutenance.date_soutenance} {soutenance.heure_debut}",

        "duree_minutes": soutenance.duree_minutes,
        "statut": soutenance.statut,

        # 🔹 salle
        "salle": soutenance.salle.name if soutenance.salle else None,

        # 🔹 jury (optionnel mais prêt)
        "jury": [
            {
                "id": j.teacher.id,
                "nom": f"{j.teacher.prenom} {j.teacher.name}",
                "role": j.role
            }
            for j in soutenance.juries
        ]
    }), 200
