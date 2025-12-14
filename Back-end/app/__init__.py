from flask import Flask
from .extensions import init_extensions
from .config import Config

from .api.auth_routes import auth_bp
from .api.rapport_routes import rapport_bp
from .api.student_routes import student_bp
from .api.salles_routes import salles_bp
from .api.soutenances_routes import soutenances_bp
from .api.users_routes import users_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    init_extensions(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(rapport_bp)
    app.register_blueprint(student_bp)
    app.register_blueprint(salles_bp)
    app.register_blueprint(soutenances_bp)
    app.register_blueprint(users_bp)

    return app
