from ..models import db, Salle
from flask import current_app


def get_all_salles():
    return Salle.query.all()


def add_salle(name):
    salle = Salle(name=name)
    db.session.add(salle)
    db.session.commit()
    return salle


def delete_salle(salle_id):
    """Supprime une salle par son ID"""
    current_app.logger.info(f"Tentative de suppression de la salle ID: {salle_id}")

    salle = Salle.query.get(salle_id)
    if not salle:
        current_app.logger.warning(f"Salle ID {salle_id} non trouvée")
        return None

    current_app.logger.info(f"Salle trouvée: {salle.name} (ID: {salle.id})")

    # Vérifier si la salle est utilisée dans des soutenances
    from ..models import Soutenance
    has_soutenances = Soutenance.query.filter_by(salle_id=salle_id).first()

    if has_soutenances:
        current_app.logger.warning(f"Salle ID {salle_id} utilisée dans des soutenances - suppression impossible")
        raise ValueError("Cette salle est utilisée dans des soutenances et ne peut pas être supprimée")

    try:
        db.session.delete(salle)
        db.session.commit()
        current_app.logger.info(f"Salle ID {salle_id} supprimée avec succès")
        return salle
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Erreur lors de la suppression de la salle ID {salle_id}: {str(e)}")
        raise