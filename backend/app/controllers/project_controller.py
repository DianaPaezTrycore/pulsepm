from flask import Blueprint, jsonify, request
from marshmallow import ValidationError

from app.schemas.project_schema import ProjectSchema
from app.services import project_service

projects_bp = Blueprint("projects", __name__)
project_schema = ProjectSchema()


@projects_bp.route("/projects", methods=["GET"])
def list_projects():
    return jsonify(project_service.list_projects()), 200


@projects_bp.route("/projects", methods=["POST"])
def create_project():
    try:
        data = project_schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({
            "error": "Validation error",
            "details": err.messages,
            "code": 422,
        }), 422
    project = project_service.create_project(data)
    return jsonify(project), 201


@projects_bp.route("/projects/<int:project_id>", methods=["GET"])
def get_project(project_id):
    project = project_service.get_project_detail(project_id)
    if project is None:
        return jsonify({"error": "Project not found", "code": 404}), 404
    return jsonify(project), 200
