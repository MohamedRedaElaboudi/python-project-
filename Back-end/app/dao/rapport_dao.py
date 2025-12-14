from ..models import Rapport, db

class RapportDAO:

    @staticmethod
    def create(auteur_id, titre, filename, storage_path):
        rapport = Rapport(
            auteur_id=auteur_id,
            titre=titre,
            filename=filename,
            storage_path=storage_path
        )
        db.session.add(rapport)
        db.session.commit()
        return rapport

    @staticmethod
    def get_latest_by_student(student_id):
        return Rapport.query.filter_by(auteur_id=student_id).order_by(Rapport.created_at.desc()).first()

    @staticmethod
    def get_all_by_student(student_id):
        return Rapport.query.filter_by(auteur_id=student_id).order_by(Rapport.created_at.desc()).all()

    @staticmethod
    def get_by_id_and_student(rapport_id, student_id):
        return Rapport.query.filter_by(id=rapport_id, auteur_id=student_id).first()

    @staticmethod
    def get_all_rapports():
        return Rapport.query.all()
