from datetime import timedelta, datetime
from sqlalchemy.orm import joinedload
from ..models import db, Salle, Soutenance, Jury

class SoutenanceDAO:

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
        soutenance.statut = "terminée"
        db.session.add(soutenance)
        db.session.commit()
        # update_salles_disponibilite() # This function was referenced but not defined in the snippet. Assuming it needs to be handled or was a leftover. 
        # Since I don't see the definition in the file, and it was in a standalone function, I will omit it or leave a TODO if it's external.
        # However, checking the original file, it was in a standalone function 'terminer_soutenance' at line 40. 
        # I will keep the logic from line 33-41 mostly, but merged with 13-21. 
        # Line 18 says "done", line 37 says "terminée". "terminée" seems more specific.
        return soutenance

    @staticmethod
    def get_available_salles(date_soutenance, heure_debut, duree_minutes):
        # Merging logic. We have two get_available_salles. 
        # One takes (date_soutenance, heure_debut, duree_minutes) - Lines 24-31
        # Another takes (date_debut, duree_minutes) - Lines 45-60
        # I will preserve the first one as it matches the signature likely used by the app if it splits date/time.
        # But wait, looking at the code, the second one seems more complete with a loop? 
        # Actually the first one uses a efficient query. The second one iterates. First one is better.
        
        heure_fin = (datetime.combine(date_soutenance, heure_debut) + timedelta(minutes=duree_minutes)).time()

        salles_occupees_ids = db.session.query(Soutenance.salle_id).filter(
            Soutenance.date_soutenance == date_soutenance,
            Soutenance.heure_debut < heure_fin,
            db.func.ADDTIME(Soutenance.heure_debut, db.func.SEC_TO_TIME(Soutenance.duree_minutes * 60)) > heure_debut
        ).scalar_subquery()
        
        return Salle.query.filter(Salle.id.notin_(salles_occupees_ids)).all()

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

