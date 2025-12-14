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
