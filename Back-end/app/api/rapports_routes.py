from flask import Blueprint, jsonify
from ..models import Rapport

rapports_bp = Blueprint('rapports_bp', __name__, url_prefix='/api/rapports')

@rapports_bp.route('/student/<int:student_id>', methods=['GET'])
def get_rapport_student(student_id):
    rapport = Rapport.query.filter_by(auteur_id=student_id).first()
    if rapport:
        return jsonify({'id': rapport.id, 'titre': rapport.titre})
    return jsonify({'error': 'Rapport non trouvé'}), 404
