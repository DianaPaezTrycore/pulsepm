from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flasgger import Swagger

db = SQLAlchemy()


def create_app(config_object=None):
    app = Flask(__name__)

    if config_object:
        app.config.from_object(config_object)
    else:
        from app.config import Config
        app.config.from_object(Config)

    db.init_app(app)

    from app import models  # noqa: F401

    CORS(app)
    Swagger(app, template={
        "info": {"title": "PulsePM API", "version": "1.0.0"},
        "basePath": "/api/v1"
    })

    from app.controllers.project_controller import projects_bp
    app.register_blueprint(projects_bp, url_prefix="/api/v1")

    return app
