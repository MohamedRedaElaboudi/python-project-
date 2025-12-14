from sqlalchemy import text
from ..extensions import db


class SoutenanceDAO:

    @staticmethod
    def get_by_student(student_id):
        query = text("""
            SELECT
                s.id,
                s.date_debut,
                s.duree_minutes,
                s.salle,
                s.statut
            FROM soutenances s
            JOIN rapports r ON r.id = s.rapport_id
            WHERE r.auteur_id = :sid
            ORDER BY r.created_at DESC
            LIMIT 1
        """)

        return db.session.execute(
            query, {"sid": student_id}
        ).mappings().first()
