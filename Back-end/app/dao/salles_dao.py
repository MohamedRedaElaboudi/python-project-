from ..models import db, Salle

class SalleDAO:
    @staticmethod
    def get_all_salles():
        return Salle.query.order_by(Salle.name).all()

    @staticmethod
    def add_salle(name: str):
        nouvelle_salle = Salle(name=name)
        db.session.add(nouvelle_salle)
        db.session.commit()
        return nouvelle_salle
