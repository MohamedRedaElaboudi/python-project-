from flask import Blueprint, request, jsonify
from ..dao.user_dao import UserDAO

users_bp = Blueprint('users', __name__, url_prefix='/api/v1/users')

@users_bp.route('/')
def get_users():
    role = request.args.get('role')
    users = UserDAO.get_all_users(role=role)
    return jsonify([{'id': u.id, 'name': u.name, 'prenom': u.prenom} for u in users])
