from ..models import Soutenance, Jury
from sqlalchemy.orm import joinedload

class SoutenanceDAO:

    @staticmethod
    def get_by_student(student_id):
        return (
            Soutenance.query
            .options(
                joinedload(Soutenance.salle),
                joinedload(Soutenance.juries).joinedload(Jury.teacher)
            )
            .filter_by(student_id=student_id)
            .order_by(Soutenance.date_soutenance.desc())
            .first()
        )
