from flask import Blueprint, request, jsonify
from ..schemas.user_schema import RegisterSchema, LoginSchema, StudentRegisterSchema
from ..services.auth_service import AuthService

auth_bp = Blueprint("auth", __name__, url_prefix="/api/v1/auth")


# ===============================
# REGISTER (prof / admin / jury / chef)
# ===============================
@auth_bp.post("/register")
def register():
    data = request.json
    errors = RegisterSchema().validate(data)

    if errors:
        return jsonify(errors), 400

    user, error = AuthService.register(data)
    if error:
        return jsonify({"error": error}), 400

    return jsonify({"message": "User created successfully"}), 201


# ===============================
# REGISTER STUDENT (spécifique)
# ===============================
@auth_bp.post("/register/student")
def register_student():
    data = request.get_json()

    print("========== DEBUG REGISTER STUDENT ==========")
    print("📥 DATA REÇUE :", data)

    errors = StudentRegisterSchema().validate(data)

    print("❌ ERREURS SCHEMA :", errors)
    print("===========================================")

    if errors:
        return jsonify({
            "message": "Validation error",
            "errors": errors,
            "received_data": data
        }), 400

    data["role"] = "student"

    user, error = AuthService.register(data)

    print("👤 USER :", user)
    print("⚠️ SERVICE ERROR :", error)

    if error:
        return jsonify({"error": error}), 400

    return jsonify({"message": "Student created successfully"}), 201



# ===============================
# LOGIN (TOUS)
# ===============================
@auth_bp.post("/login")
def login():
    data = request.json
    errors = LoginSchema().validate(data)

    if errors:
        return jsonify(errors), 400

    result, error = AuthService.login(data)
    if error:
        return jsonify({"error": error}), 401

    user = result["user"]
    token = result["token"]

    return jsonify({
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "prenom": user.prenom,
            "email": user.email,
            "role": user.role
        }
    }), 200
