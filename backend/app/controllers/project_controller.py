from flask import Blueprint, jsonify, request
from marshmallow import ValidationError

from app.schemas.project_schema import ProjectSchema
from app.services import project_service

projects_bp = Blueprint("projects", __name__)
project_schema = ProjectSchema()


@projects_bp.route("/projects", methods=["GET"])
def list_projects():
    """
    List all projects
    ---
    tags:
      - Projects
    responses:
      200:
        description: List of projects
        schema:
          type: array
          items:
            $ref: '#/definitions/Project'
    """
    return jsonify(project_service.list_projects()), 200


@projects_bp.route("/projects", methods=["POST"])
def create_project():
    """
    Create a new project
    ---
    tags:
      - Projects
    parameters:
      - in: body
        name: body
        required: true
        schema:
          $ref: '#/definitions/ProjectInput'
    responses:
      201:
        description: Project created
        schema:
          $ref: '#/definitions/Project'
      422:
        description: Validation error
        schema:
          $ref: '#/definitions/ValidationError'
    """
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
    """
    Get project detail with consolidated EVM indicators
    ---
    tags:
      - Projects
    parameters:
      - in: path
        name: project_id
        type: integer
        required: true
    responses:
      200:
        description: Project detail with activities and EVM indicators
        schema:
          $ref: '#/definitions/ProjectDetail'
      404:
        description: Project not found
        schema:
          $ref: '#/definitions/Error'
    """
    project = project_service.get_project_detail(project_id)
    if project is None:
        return jsonify({"error": "Project not found", "code": 404}), 404
    return jsonify(project), 200


@projects_bp.route("/projects/<int:project_id>", methods=["PUT"])
def update_project(project_id):
    """
    Update project name and description
    ---
    tags:
      - Projects
    parameters:
      - in: path
        name: project_id
        type: integer
        required: true
      - in: body
        name: body
        required: true
        schema:
          $ref: '#/definitions/ProjectInput'
    responses:
      200:
        description: Project updated
        schema:
          $ref: '#/definitions/Project'
      404:
        description: Project not found
        schema:
          $ref: '#/definitions/Error'
      422:
        description: Validation error
        schema:
          $ref: '#/definitions/ValidationError'
    """
    try:
        data = project_schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({
            "error": "Validation error",
            "details": err.messages,
            "code": 422,
        }), 422
    project = project_service.update_project(project_id, data)
    if project is None:
        return jsonify({"error": "Project not found", "code": 404}), 404
    return jsonify(project), 200


@projects_bp.route("/projects/<int:project_id>", methods=["DELETE"])
def delete_project(project_id):
    """
    Delete a project (cascades to its activities)
    ---
    tags:
      - Projects
    parameters:
      - in: path
        name: project_id
        type: integer
        required: true
    responses:
      204:
        description: Project deleted
      404:
        description: Project not found
        schema:
          $ref: '#/definitions/Error'
    """
    deleted = project_service.delete_project(project_id)
    if not deleted:
        return jsonify({"error": "Project not found", "code": 404}), 404
    return "", 204
