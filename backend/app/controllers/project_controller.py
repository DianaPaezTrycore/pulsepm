from flask import Blueprint, jsonify

from app.services import project_service

projects_bp = Blueprint("projects", __name__)


@projects_bp.route("/projects", methods=["GET"])
def list_projects():
    return jsonify(project_service.list_projects()), 200
