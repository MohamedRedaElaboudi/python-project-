from flask import Blueprint, request, jsonify
from ..services.salles_service import lister_salles, creer_salle,supprimer_salle

salles_bp = Blueprint('salles_bp', __name__, url_prefix='/api/salles')

@salles_bp.route('/', methods=['GET'])
def get_salles():
    salles = lister_salles()
    return jsonify([
        {
            'id': s.id,
            'name': s.name
        } for s in salles
    ]), 200


@salles_bp.route('/', methods=['POST'])
def add_new_salle():
    data = request.get_json()
    name = data.get('name')

    if not name:
        return jsonify({'error': 'Le nom de la salle est requis'}), 400

    salle = creer_salle(name)

    return jsonify({
        'id': salle.id,
        'name': salle.name
    }), 201


@salles_bp.route('/<int:salle_id>', methods=['DELETE'])
def delete_salle_route(salle_id):
    """Supprime une salle"""
    result = supprimer_salle(salle_id)

    if result["success"]:
        return jsonify({"message": result["message"]}), 200
    else:
        return jsonify({"error": result["message"]}), 400
