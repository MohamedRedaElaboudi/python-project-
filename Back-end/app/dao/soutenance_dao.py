
from datetime import timedelta, datetime
from ..models import db, Salle, Soutenance

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

def terminer_soutenance(soutenance_id: int):
    soutenance = Soutenance.query.get(soutenance_id)
    if not soutenance:
        return None
    soutenance.statut = "terminée"
    db.session.add(soutenance)
    db.session.commit()
    update_salles_disponibilite()  # Mettre à jour la disponibilité après la fin
    return soutenance



def get_available_salles(date_debut, duree_minutes):
    date_fin = date_debut + timedelta(minutes=duree_minutes)
    salles = Salle.query.all()
    available = []

    for salle in salles:
        conflict = Soutenance.query.filter(
            Soutenance.salle_id == salle.id,
            Soutenance.date_debut < date_fin,
            (Soutenance.date_debut + db.func.interval(Soutenance.duree_minutes, "MINUTE")) > date_debut
        ).first()

        if not conflict:
            available.append(salle)

    return available


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

