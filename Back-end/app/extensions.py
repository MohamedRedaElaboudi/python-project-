from flask_sqlalchemy import SQLAlchemy
<<<<<<< HEAD
from flask_jwt_extended import JWTManager
from flask_cors import CORS

db = SQLAlchemy()
jwt = JWTManager()

def init_extensions(app):
    CORS(app)
    db.init_app(app)
    jwt.init_app(app)
=======

db = SQLAlchemy()
>>>>>>> imane
