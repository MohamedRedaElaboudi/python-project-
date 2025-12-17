from ..dao.salles_dao import get_all_salles, add_salle, delete_salle
from flask import current_app


def lister_salles():
    return get_all_salles()


def creer_salle(name):
    return add_salle(name)


def supprimer_salle(salle_id):
    """Supprime une salle avec vérification des contraintes"""
    current_app.logger.info(f"Service: suppression de la salle ID: {salle_id}")

    try:
        salle = delete_salle(salle_id)
        if not salle:
            current_app.logger.warning(f"Service: salle ID {salle_id} non trouvée")
            return {"success": False, "message": "Salle non trouvée"}

        current_app.logger.info(f"Service: salle ID {salle_id} supprimée avec succès")
        return {"success": True, "message": "Salle supprimée avec succès"}

    except ValueError as e:
        current_app.logger.error(f"Service: erreur de validation - {str(e)}")
        return {"success": False, "message": str(e)}

    except Exception as e:
        current_app.logger.error(f"Service: erreur inattendue - {str(e)}")
        return {"success": False, "message": f"Erreur lors de la suppression: {str(e)}"}