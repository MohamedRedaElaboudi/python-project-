from datetime import timedelta, datetime
from ..models import db, Salle, Soutenance

def get_all_soutenances():
    return Soutenance.query.all()

def add_soutenance(student_id, teacher_id, salle_id, date_debut, duree_minutes):
    nouvelle_soutenance = Soutenance(
        student_id=student_id,
        teacher_id=teacher_id,
        salle_id=salle_id,
        date_debut=date_debut,
        duree_minutes=duree_minutes,
        statut="planifiée"
    )
    db.session.add(nouvelle_soutenance)
    db.session.commit()
    return nouvelle_soutenance

def update_salles_disponibilite():
    """Met à jour automatiquement la disponibilité des salles selon les soutenances en cours."""
    maintenant = datetime.now()
    soutenances = Soutenance.query.all()
    for s in soutenances:
        salle = Salle.query.get(s.salle_id)
        if not salle:
            continue
        s_start = s.date_debut
        s_end = s_start + timedelta(minutes=s.duree_minutes)
        # Si la soutenance est terminée ou passée, salle disponible
        if maintenant >= s_end:
            salle.disponible = True
        else:
            salle.disponible = False
        db.session.add(salle)
    db.session.commit()

def get_teacher_soutenances_between(teacher_id, start, end):
    """Retourne les soutenances d'un enseignant qui se chevauchent avec un intervalle donné."""
    soutenances = Soutenance.query.filter_by(teacher_id=teacher_id).all()
    conflicts = []
    for s in soutenances:
        s_start = s.date_debut
        s_end = s_start + timedelta(minutes=s.duree_minutes)
        if s_start < end and s_end > start:
            conflicts.append(s)
    return conflicts

def get_student_soutenances(student_id):
    return Soutenance.query.filter_by(student_id=student_id).all()

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

