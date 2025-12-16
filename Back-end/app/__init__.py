from flask import Flask

from .config import Config
from .extensions import db
from .api.salles_routes import salles_bp
from .api.soutenances_routes import soutenances_bp
from .api.users_routes import users_bp
from .api.juries_routes import jurys_bp
from .api.auth_routes import auth_bp
from .api.rapport_routes import rapport_bp
from .api.student_routes import student_bp

from .api.plagiat.plagiat_analysis import plagiat_analysis_bp
from .api.plagiat.plagiat_overview import plagiat_overview_bp
from .api.plagiat.plagiat_dashboard import plagiat_dashboard_bp

from flask_cors import CORS
from .extensions import init_extensions


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:3039"}})

    app.register_blueprint(plagiat_analysis_bp)
    app.register_blueprint(plagiat_overview_bp)
    app.register_blueprint(plagiat_dashboard_bp)

    app.register_blueprint(salles_bp, url_prefix='/api/salles')
    app.register_blueprint(soutenances_bp, url_prefix='/api/soutenances')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(jurys_bp, url_prefix='/api/juries')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(rapport_bp, url_prefix='/api/rapport')
    app.register_blueprint(student_bp, url_prefix='/api/student')

    init_extensions(app)

    return app
