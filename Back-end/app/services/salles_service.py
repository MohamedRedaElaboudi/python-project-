from ..dao.salles_dao import SalleDAO

def lister_salles():
    return SalleDAO.get_all_salles()

def creer_salle(name):
    return SalleDAO.add_salle(name)
