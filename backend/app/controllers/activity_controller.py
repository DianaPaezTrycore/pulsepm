from flask import Blueprint, jsonify, request
from marshmallow import ValidationError

from app.schemas.activity_schema import ActivitySchema
from app.services import activity_service

activities_bp = Blueprint("activities", __name__)
activity_schema = ActivitySchema()


@activities_bp.route("/projects/<int:project_id>/activities", methods=["POST"])
def create_activity(project_id):
    try:
        data = activity_schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({
            "error": "Validation error",
            "details": err.messages,
            "code": 422,
        }), 422
    activity = activity_service.create_activity(project_id, data)
    if activity is None:
        return jsonify({"error": "Project not found", "code": 404}), 404
    return jsonify(activity), 201


@activities_bp.route(
    "/projects/<int:project_id>/activities/<int:activity_id>",
    methods=["PUT"],
)
def update_activity(project_id, activity_id):
    try:
        data = activity_schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({
            "error": "Validation error",
            "details": err.messages,
            "code": 422,
        }), 422
    activity = activity_service.update_activity(project_id, activity_id, data)
    if activity is None:
        return jsonify({"error": "Activity not found", "code": 404}), 404
    return jsonify(activity), 200


@activities_bp.route(
    "/projects/<int:project_id>/activities/<int:activity_id>",
    methods=["DELETE"],
)
def delete_activity(project_id, activity_id):
    deleted = activity_service.delete_activity(project_id, activity_id)
    if not deleted:
        return jsonify({"error": "Activity not found", "code": 404}), 404
    return "", 204
