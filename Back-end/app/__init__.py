from flask import Flask
from .config import Config
from .extensions import db
from .api.salles_routes import salles_bp  # à créer pour les routes API
from .api.soutenances_routes import soutenances_bp

from .api.users_routes import users_bp
from flask_cors import CORS
def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    # Autoriser React à accéder au backend
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:3039"}})

    # Enregistrer les blueprints
    app.register_blueprint(salles_bp)
    app.register_blueprint(soutenances_bp)


    app.register_blueprint(users_bp)

    return app
