from ..extensions import db
from ..models import User, Student

class StudentProfileDAO:

    @staticmethod
    def get_full_profile(user_id):
        user = User.query.get(user_id)
        student = Student.query.filter_by(user_id=user_id).first()
        return user, student

    @staticmethod
    def update_profile(user, student, data):
        # 🔹 User fields modifiables
        user.name = data.get("name", user.name)
        user.prenom = data.get("prenom", user.prenom)

        # 🔹 Student fields modifiables
        if student:
            student.tel = data.get("tel", student.tel)
            student.filiere = data.get("filiere", student.filiere)
            student.niveau = data.get("niveau", student.niveau)

        db.session.commit()
        return user, student
