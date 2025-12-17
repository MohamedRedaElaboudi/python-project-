from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..utils.security import student_only
from ..dao.student_profile_dao import StudentProfileDAO

student_profile_bp = Blueprint(
    "student_profile",
    __name__,
    url_prefix="/api/v1/student/profile"
)

# ===============================
# 👤 GET PROFIL ÉTUDIANT
# ===============================
@student_profile_bp.route("", methods=["GET"])
@jwt_required()
@student_only
def get_profile():
    user_id = int(get_jwt_identity())

    user, student = StudentProfileDAO.get_full_profile(user_id)

    return jsonify({
        "id": user.id,
        "name": user.name,
        "prenom": user.prenom,
        "email": user.email,
        "role": user.role,

        "cin": student.cin if student else None,
        "cne": student.cne if student else None,
        "tel": student.tel if student else None,
        "filiere": student.filiere if student else None,
        "niveau": student.niveau if student else None,
    }), 200


# ===============================
# ✏️ UPDATE PROFIL ÉTUDIANT
# ===============================
@student_profile_bp.route("", methods=["PUT"])
@jwt_required()
@student_only
def update_profile():
    user_id = int(get_jwt_identity())
    data = request.json

    user, student = StudentProfileDAO.get_full_profile(user_id)
    user, student = StudentProfileDAO.update_profile(user, student, data)

    return jsonify({
        "id": user.id,
        "name": user.name,
        "prenom": user.prenom,
        "email": user.email,
        "role": user.role,

        "cin": student.cin if student else None,
        "cne": student.cne if student else None,
        "tel": student.tel if student else None,
        "filiere": student.filiere if student else None,
        "niveau": student.niveau if student else None,
    }), 200
