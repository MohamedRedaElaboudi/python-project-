from app import create_app
from app.extensions import db

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Crée toutes les tables si elles n'existent pas
        print("Tables créées avec succès !")
    app.run(debug=True)
