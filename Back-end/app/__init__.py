from flask import Flask
import os

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

    import logging
    from logging.handlers import RotatingFileHandler
    
    if not os.path.exists('logs'):
        os.mkdir('logs')
    file_handler = RotatingFileHandler('logs/backend.log', maxBytes=10240, backupCount=10)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.INFO)
    app.logger.info('Backend startup')


    db.init_app(app)
    # Autoriser React à accéder au backend
    # Enhanced CORS configuration for blob/binary responses (PDF files)
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "expose_headers": ["Content-Disposition", "Content-Type"],
            "supports_credentials": True
        }
    })

    # Enregistrer les blueprints
    app.register_blueprint(salles_bp)
    app.register_blueprint(soutenances_bp)


    app.register_blueprint(dashboard_bp)

    app.register_blueprint(users_bp)

    init_extensions(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(jurys_bp)
    from .api.jury_dashboard_routes import jury_dashboard_bp
    app.register_blueprint(jury_dashboard_bp)
    app.register_blueprint(rapport_bp)
    
    from .api.plagiat import plagiat_bp
    app.register_blueprint(plagiat_bp)

    from .api.plagiat.plagiat_dashboard import plagiat_dashboard_bp
    app.register_blueprint(plagiat_dashboard_bp)
    
    from .api.plagiat.plagiat_overview import plagiat_overview_bp
    app.register_blueprint(plagiat_overview_bp)
    
    from .api.plagiat.plagiat_analysis import plagiat_analysis_bp
    app.register_blueprint(plagiat_analysis_bp)

    app.register_blueprint(student_bp)
    app.register_blueprint(student_profile_bp)

    return app
