from flask import Flask
from .extensions import init_extensions
from .config import Config

from .api.auth_routes import auth_bp
from .api.rapport_routes import rapport_bp
from .api.student_routes import student_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    init_extensions(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(rapport_bp)
    app.register_blueprint(student_bp)

    return app
