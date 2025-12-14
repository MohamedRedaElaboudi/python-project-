from flask import Blueprint, request, jsonify, send_file, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
import os

from ..dao.rapport_dao import RapportDAO
from ..utils.file_utils import save_pdf

rapport_bp = Blueprint(
    "rapport",
    __name__,
    url_prefix="/api/v1/rapports"
)

# ===============================
# 📤 UPLOAD RAPPORT
# ===============================
@rapport_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_rapport():
    identity = get_jwt_identity()
    student_id = identity["id"] if isinstance(identity, dict) else identity

    file = request.files.get("file")
    titre = request.form.get("titre")

    if not file or not titre:
        return jsonify({"error": "Fichier ou titre manquant"}), 400

    filename, path = save_pdf(file)

    RapportDAO.create(
        auteur_id=student_id,
        titre=titre,
        filename=filename,
        storage_path=path
    )

    return jsonify({"message": "Rapport uploadé avec succès"}), 201


# ===============================
# 📥 DOWNLOAD RAPPORT PAR ID
# ===============================
@rapport_bp.route("/download/<int:rapport_id>", methods=["GET"])
@jwt_required()
def download_rapport(rapport_id):
    identity = get_jwt_identity()
    student_id = identity["id"] if isinstance(identity, dict) else identity

    rapport = RapportDAO.get_by_id_and_student(rapport_id, student_id)

    if not rapport:
        abort(404, "Rapport introuvable")

    file_path = rapport["storage_path"]

    if not os.path.exists(file_path):
        abort(404, "Fichier introuvable")

    return send_file(
        file_path,
        as_attachment=True,
        download_name=rapport["filename"]
    )
