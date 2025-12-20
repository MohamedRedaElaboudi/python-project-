from app import create_app, db
from sqlalchemy import text

app = create_app()

with app.app_context():
    try:
        # 1. Supprimer les tables existantes (incorrectes)
        print("Suppression des anciennes tables 'plagiat_matches' et 'plagiat_analyses'...")
        # On désactive les vérifications de clés étrangères temporairement pour éviter les erreur d'ordre
        db.session.execute(text("SET FOREIGN_KEY_CHECKS = 0"))
        db.session.execute(text("DROP TABLE IF EXISTS plagiat_matches"))
        db.session.execute(text("DROP TABLE IF EXISTS plagiat_analyses"))
        db.session.execute(text("SET FOREIGN_KEY_CHECKS = 1"))
        db.session.commit()
        print("Tables supprimées.")

        # 2. Recréer les tables avec la nouvelle définition du modèle
        print("Création des nouvelles tables...")
        db.create_all()
        print("Tables 'plagiat_analyses' et 'plagiat_matches' recréées avec succès et synchronisées avec le code.")

    except Exception as e:
        print(f"Erreur lors de la mise à jour des tables : {e}")
        db.session.rollback()
