from flask import Flask

from .config import Config
from .extensions import db
from .api.salles_routes import salles_bp  # à créer pour les routes API
from .api.soutenances_routes import soutenances_bp

from .api.users_routes import users_bp
from flask_cors import CORS
from .extensions import init_extensions
from .config import Config
from .api.juries_routes import jurys_bp
from .api.auth_routes import auth_bp
from .api.rapport_routes import rapport_bp
from .api.student_routes import student_bp
from .api.student_profile_routes import student_profile_bp
# app.py ou __init__.py
from .api.dashboard import dashboard_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)


    db.init_app(app)
    # Autoriser React à accéder au backend
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:3039"}})

    # Enregistrer les blueprints
    app.register_blueprint(salles_bp)
    app.register_blueprint(soutenances_bp)


    app.register_blueprint(dashboard_bp)

    app.register_blueprint(users_bp)

    init_extensions(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(jurys_bp)
    app.register_blueprint(rapport_bp)
    app.register_blueprint(student_bp)
    app.register_blueprint(student_profile_bp)

    return app
