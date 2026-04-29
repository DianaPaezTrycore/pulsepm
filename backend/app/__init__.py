from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flasgger import Swagger

db = SQLAlchemy()


SWAGGER_TEMPLATE = {
    "info": {
        "title": "PulsePM API",
        "version": "1.0.0",
        "description": (
            "REST API for project management with "
            "Earned Value Management (EVM) indicators."
        ),
    },
    "basePath": "/api/v1",
    "tags": [
        {"name": "Projects", "description": "Project CRUD and EVM consolidation"},
        {"name": "Activities", "description": "Activity CRUD inside a project"},
    ],
    "definitions": {
        "Project": {
            "type": "object",
            "properties": {
                "id": {"type": "integer", "example": 1},
                "name": {"type": "string", "example": "Proyecto Alpha"},
                "description": {"type": "string", "example": "Descripción opcional"},
            },
        },
        "ProjectInput": {
            "type": "object",
            "required": ["name"],
            "properties": {
                "name": {
                    "type": "string",
                    "minLength": 1,
                    "maxLength": 255,
                    "example": "Proyecto Alpha",
                },
                "description": {
                    "type": "string",
                    "example": "Descripción opcional",
                },
            },
        },
        "Activity": {
            "type": "object",
            "properties": {
                "id": {"type": "integer", "example": 1},
                "project_id": {"type": "integer", "example": 1},
                "name": {"type": "string", "example": "Actividad 1"},
                "bac": {"type": "number", "format": "float", "example": 10000},
                "planned_progress": {"type": "number", "format": "float", "example": 60},
                "actual_progress": {"type": "number", "format": "float", "example": 40},
                "actual_cost": {"type": "number", "format": "float", "example": 7000},
            },
        },
        "ActivityInput": {
            "type": "object",
            "required": [
                "name", "bac", "planned_progress", "actual_progress", "actual_cost",
            ],
            "properties": {
                "name": {
                    "type": "string",
                    "minLength": 1,
                    "maxLength": 255,
                    "example": "Actividad 1",
                },
                "bac": {
                    "type": "number",
                    "format": "float",
                    "minimum": 0,
                    "exclusiveMinimum": True,
                    "example": 10000,
                },
                "planned_progress": {
                    "type": "number",
                    "format": "float",
                    "minimum": 0,
                    "maximum": 100,
                    "example": 60,
                },
                "actual_progress": {
                    "type": "number",
                    "format": "float",
                    "minimum": 0,
                    "maximum": 100,
                    "example": 40,
                },
                "actual_cost": {
                    "type": "number",
                    "format": "float",
                    "minimum": 0,
                    "example": 7000,
                },
            },
        },
        "Indicators": {
            "type": "object",
            "properties": {
                "pv": {"type": "number", "format": "float"},
                "ev": {"type": "number", "format": "float"},
                "cv": {"type": "number", "format": "float"},
                "sv": {"type": "number", "format": "float"},
                "cpi": {"type": "number", "format": "float"},
                "spi": {"type": "number", "format": "float"},
                "eac": {"type": "number", "format": "float"},
                "vac": {"type": "number", "format": "float"},
            },
        },
        "ActivityWithIndicators": {
            "type": "object",
            "properties": {
                "id": {"type": "integer"},
                "name": {"type": "string"},
                "bac": {"type": "number", "format": "float"},
                "planned_progress": {"type": "number", "format": "float"},
                "actual_progress": {"type": "number", "format": "float"},
                "actual_cost": {"type": "number", "format": "float"},
                "indicators": {"$ref": "#/definitions/Indicators"},
            },
        },
        "ProjectIndicators": {
            "type": "object",
            "properties": {
                "pv": {"type": "number", "format": "float"},
                "ev": {"type": "number", "format": "float"},
                "cv": {"type": "number", "format": "float"},
                "sv": {"type": "number", "format": "float"},
                "cpi": {"type": "number", "format": "float"},
                "spi": {"type": "number", "format": "float"},
                "eac": {"type": "number", "format": "float"},
                "vac": {"type": "number", "format": "float"},
                "cpi_interpretation": {
                    "type": "string",
                    "example": "Sobre presupuesto (ineficiente en costos)",
                },
                "spi_interpretation": {
                    "type": "string",
                    "example": "Atrasado según cronograma",
                },
            },
        },
        "ProjectDetail": {
            "type": "object",
            "properties": {
                "id": {"type": "integer"},
                "name": {"type": "string"},
                "description": {"type": "string"},
                "activities": {
                    "type": "array",
                    "items": {"$ref": "#/definitions/ActivityWithIndicators"},
                },
                "project_indicators": {"$ref": "#/definitions/ProjectIndicators"},
            },
        },
        "Error": {
            "type": "object",
            "properties": {
                "error": {"type": "string", "example": "Project not found"},
                "code": {"type": "integer", "example": 404},
            },
        },
        "ValidationError": {
            "type": "object",
            "properties": {
                "error": {"type": "string", "example": "Validation error"},
                "details": {
                    "type": "object",
                    "example": {"bac": "Must be greater than 0"},
                },
                "code": {"type": "integer", "example": 422},
            },
        },
    },
}


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
    Swagger(app, template=SWAGGER_TEMPLATE)

    from app.controllers.project_controller import projects_bp
    from app.controllers.activity_controller import activities_bp
    app.register_blueprint(projects_bp, url_prefix="/api/v1")
    app.register_blueprint(activities_bp, url_prefix="/api/v1")

    @app.errorhandler(500)
    def handle_internal_error(error):
        return jsonify({"error": "Internal server error", "code": 500}), 500

    return app
