from sqlalchemy import text
from ..extensions import db


class RapportDAO:

    # ===============================
    # ➕ CREATE (UPLOAD)
    # ===============================
    @staticmethod
    def create(auteur_id, titre, filename, storage_path):
        query = text("""
            INSERT INTO rapports (
                auteur_id,
                titre,
                filename,
                storage_path,
                status,
                created_at
            )
            VALUES (
                :auteur_id,
                :titre,
                :filename,
                :storage_path,
                'uploaded',
                NOW()
            )
        """)
        db.session.execute(query, {
            "auteur_id": auteur_id,
            "titre": titre,
            "filename": filename,
            "storage_path": storage_path
        })
        db.session.commit()

    # ===============================
    # 📌 DERNIER RAPPORT (Dashboard)
    # ===============================
    @staticmethod
    def get_latest_by_student(student_id):
        query = text("""
            SELECT
                id,
                titre,
                filename,
                status,
                created_at,
                storage_path
            FROM rapports
            WHERE auteur_id = :sid
            ORDER BY created_at DESC
            LIMIT 1
        """)
        return db.session.execute(
            query, {"sid": student_id}
        ).mappings().first()

    # ===============================
    # 📋 TOUS LES RAPPORTS (Mes Rapports)
    # ===============================
    @staticmethod
    def get_all_by_student(student_id):
        query = text("""
            SELECT
                id,
                titre,
                status,
                created_at
            FROM rapports
            WHERE auteur_id = :sid
            ORDER BY created_at DESC
        """)
        return db.session.execute(
            query, {"sid": student_id}
        ).mappings().all()

    # ===============================
    # 📥 RAPPORT PAR ID (PDF UNIQUE)
    # ===============================
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
