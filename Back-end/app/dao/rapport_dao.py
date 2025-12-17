
from ..models import Rapport, db

def get_all_rapports():
    return Rapport.query.all()

def get_rapport_by_student(student_id: int):
    # Retourne le rapport le plus récent de l'étudiant
    return Rapport.query.filter_by(auteur_id=student_id).order_by(Rapport.created_at.desc()).first()

def add_rapport(auteur_id: int, titre: str, filename: str, storage_path: str):
    rapport = Rapport(
        auteur_id=auteur_id,
        titre=titre,
        filename=filename,
        storage_path=storage_path
    )
    db.session.add(rapport)
    db.session.commit()
    return rapport

from sqlalchemy import text
from ..extensions import db


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
        query = text("""
            SELECT
                id,
                titre,
                filename,
                storage_path,
                status,
                created_at
            FROM rapports
            WHERE id = :rid AND auteur_id = :sid
        """)
        return db.session.execute(
            query,
            {"rid": rapport_id, "sid": student_id}
        ).mappings().first()

