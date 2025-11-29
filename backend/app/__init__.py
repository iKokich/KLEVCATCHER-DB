# app/__init__.py
from flask import Flask
from flask_cors import CORS
from .config import Config
from .models import db


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

    with app.app_context():
        db.create_all()
        from . import routes  # noqa: F401

    return app