from flask import Blueprint, request, jsonify
from ..models import User, db
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash

users_bp = Blueprint('users_bp', __name__, url_prefix='/api/users')

@users_bp.route('/')
def get_users():
    users = User.query.all()
    return jsonify([{
        'id': user.id,
        'prenom': user.prenom,
        'name': user.name,
        'email': user.email,
        'role': user.role,
        'created_at': user.created_at.isoformat() if user.created_at else None,
        'updated_at': user.updated_at.isoformat() if user.updated_at else None
    } for user in users])

# Récupérer un utilisateur spécifique
@users_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify({
        'id': user.id,
        'prenom': user.prenom,
        'name': user.name,
        'email': user.email,
        'role': user.role,
        'created_at': user.created_at.isoformat() if user.created_at else None,
        'updated_at': user.updated_at.isoformat() if user.updated_at else None
    })


# Mettre à jour un utilisateur
@users_bp.route('/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()

    try:
        # Vérifier si l'email existe déjà pour un autre utilisateur
        if 'email' in data and data['email'] != user.email:
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user and existing_user.id != user_id:
                return jsonify({'error': 'Cet email est déjà utilisé'}), 400

        # Mettre à jour les champs
        if 'prenom' in data:
            user.prenom = data['prenom']
        if 'name' in data:
            user.name = data['name']
        if 'email' in data:
            user.email = data['email']
        if 'role' in data and data['role'] in ['student', 'teacher', 'jury', 'admin', 'chef']:
            user.role = data['role']
        if 'password' in data and data['password']:
            user.password_hash = generate_password_hash(data['password'])

        user.updated_at = db.func.current_timestamp()
        db.session.commit()

        return jsonify({
            'message': 'Utilisateur mis à jour avec succès',
            'user': {
                'id': user.id,
                'prenom': user.prenom,
                'name': user.name,
                'email': user.email,
                'role': user.role
            }
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# Supprimer un utilisateur - CORRECTION ICI
@users_bp.route('/<int:user_id>', methods=['DELETE'])  # Enlevez '/api/users/' ici
@jwt_required()
def delete_user(user_id):
    user = User.query.get_or_404(user_id)

    # Empêcher la suppression de son propre compte
    current_user_id = get_jwt_identity()
    if user_id == current_user_id:
        return jsonify({'error': 'Vous ne pouvez pas supprimer votre propre compte'}), 400

    try:
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'Utilisateur supprimé avec succès'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


