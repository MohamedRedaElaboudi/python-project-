from flask import Blueprint, request, jsonify
from ..models import User

users_bp = Blueprint('users_bp', __name__, url_prefix='/api/users')

@users_bp.route('/')
def get_users():
    role = request.args.get('role')
    query = User.query
    if role:
        query = query.filter_by(role=role)
    users = query.all()
    return jsonify([{'id': u.id, 'name': u.name} for u in users])
