
from ..extensions import db
from ..models import User

class UserDAO:

    @staticmethod
    def get_by_email(email):
        return User.query.filter_by(email=email).first()

    @staticmethod
    def create_user(name, prenom, email, password_hash, role):
        user = User(
            name=name,
            prenom=prenom,

            email=email,
            password_hash=password_hash,
            role=role
        )
        db.session.add(user)
        db.session.commit()   # ✅ OBLIGATOIRE !!!
        return user

    @staticmethod
    def get_all_users(role=None):
        query = User.query
        if role:
            query = query.filter_by(role=role)
        return query.all()
