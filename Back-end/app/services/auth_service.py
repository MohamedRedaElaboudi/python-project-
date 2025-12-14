from werkzeug.security import generate_password_hash, check_password_hash
from ..dao.user_dao import UserDAO
from ..dao.student_dao import StudentDAO
from ..models import Student
from flask_jwt_extended import create_access_token
from datetime import timedelta


class AuthService:

    @staticmethod
    def register(data):
        # 1️⃣ Vérifier email
        if UserDAO.get_by_email(data["email"]):
            return None, "Email already exists"

        # 2️⃣ Créer USER (commun à tous)
        hashed = generate_password_hash(data["password"])

        user = UserDAO.create_user(
            name=data["name"],
            prenom=data["prenom"],
            email=data["email"],
            password_hash=hashed,
            role=data["role"]
        )

        # 3️⃣ SI étudiant → créer le profil Student
        if data["role"] == "student":

            # sécurité unicité
            if StudentDAO.get_by_cin(data["cin"]):
                return None, "CIN already exists"

            if StudentDAO.get_by_cne(data["cne"]):
                return None, "CNE already exists"

            student = Student(
                user_id=user.id,
                cin=data["cin"],
                cne=data["cne"],
                tel=data.get("tel"),
                filiere=data["filiere"],
                niveau=data["niveau"]
            )

            StudentDAO.create(student)

        return user, None

    @staticmethod
    def login(data):
        # 🔒 inchangé
        user = UserDAO.get_by_email(data["email"])

        if not user or not check_password_hash(user.password_hash, data["password"]):
            return None, "Invalid credentials"

        token = create_access_token(
            identity=str(user.id),
            additional_claims={"role": user.role},
            expires_delta=timedelta(hours=12)
        )

        return {"token": token, "user": user}, None
