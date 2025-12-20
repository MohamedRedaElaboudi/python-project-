from app import create_app, db

app = create_app()

with app.app_context():
    try:
        db.create_all()
        print("Toutes les tables ont été créées avec succès (y compris PlagiatAnalysis et PlagiatMatch).")
    except Exception as e:
        print(f"Erreur lors de la création des tables : {e}")
