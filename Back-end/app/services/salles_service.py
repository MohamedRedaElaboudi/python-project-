from ..dao.salles_dao import get_all_salles, add_salle

def lister_salles():
    return get_all_salles()

def creer_salle(name):
    return add_salle(name)
