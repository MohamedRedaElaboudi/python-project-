from datetime import timedelta, datetime
from ..models import db, Salle, Soutenance

class SoutenanceDAO:

    @staticmethod
    def get_all_soutenances():
        return Soutenance.query.all()

    @staticmethod
    def create(student_id, salle_id, date_soutenance, heure_debut, duree_minutes):
        nouvelle_soutenance = Soutenance(
            student_id=student_id,
            salle_id=salle_id,
            date_soutenance=date_soutenance,
            heure_debut=heure_debut,
            duree_minutes=duree_minutes,
            statut="planned"
        )
        db.session.add(nouvelle_soutenance)
        db.session.commit()
        return nouvelle_soutenance

    @staticmethod
    def get_all_by_student(student_id):
        return Soutenance.query.filter_by(student_id=student_id).all()

    @staticmethod
    def get_latest_by_student(student_id):
        return Soutenance.query.filter_by(student_id=student_id).order_by(Soutenance.date_soutenance.desc(), Soutenance.heure_debut.desc()).first()

    @staticmethod
    def terminer_soutenance(soutenance_id: int):
        soutenance = Soutenance.query.get(soutenance_id)
        if not soutenance:
            return None
        soutenance.statut = "done"
        db.session.add(soutenance)
        db.session.commit()
        return soutenance

    @staticmethod
    def get_available_salles(date_soutenance, heure_debut, duree_minutes):
        heure_fin = (datetime.combine(date_soutenance, heure_debut) + timedelta(minutes=duree_minutes)).time()

        salles_occupees_ids = db.session.query(Soutenance.salle_id).filter(
            Soutenance.date_soutenance == date_soutenance,
            Soutenance.heure_debut < heure_fin,
            db.func.ADDTIME(Soutenance.heure_debut, db.func.SEC_TO_TIME(Soutenance.duree_minutes * 60)) > heure_debut
        ).scalar_subquery()

        salles_disponibles = Salle.query.filter(Salle.id.notin_(salles_occupees_ids)).all()
        
        return salles_disponibles
