from ..extensions import db
from ..models import Student

class StudentDAO:

    @staticmethod
    def create(student):
        db.session.add(student)
        db.session.commit()
        return student

    @staticmethod
    def get_by_cin(cin):
        return Student.query.filter_by(cin=cin).first()

    @staticmethod
    def get_by_cne(cne):
        return Student.query.filter_by(cne=cne).first()
