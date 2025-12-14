from ..dao.rapport_dao import get_all_rapports, get_rapport_by_student, add_rapport
from ..models import Rapport

def lister_rapports():
    return get_all_rapports()

def rapport_par_student(student_id: int) -> Rapport:
    return get_rapport_by_student(student_id)

def creer_rapport(auteur_id: int, titre: str, filename: str, storage_path: str) -> Rapport:
    return add_rapport(auteur_id, titre, filename, storage_path)
