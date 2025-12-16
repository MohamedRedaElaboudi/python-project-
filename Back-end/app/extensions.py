from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()

from flask_jwt_extended import JWTManager
from flask_cors import CORS

db = SQLAlchemy()
jwt = JWTManager()

def init_extensions(app):
    jwt.init_app(app)

