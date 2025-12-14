from flask_jwt_extended import get_jwt
from functools import wraps
from flask import jsonify

def student_only(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        if claims.get("role") != "student":
            return jsonify({"error": "Student access only"}), 403
        return fn(*args, **kwargs)
    return wrapper
