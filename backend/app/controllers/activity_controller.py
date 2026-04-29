from flask import Blueprint, jsonify, request
from marshmallow import ValidationError

from app.responses import not_found_response, validation_error_response
from app.schemas.activity_schema import ActivitySchema
from app.services import activity_service

activities_bp = Blueprint("activities", __name__)
activity_schema = ActivitySchema()


@activities_bp.route("/projects/<int:project_id>/activities", methods=["POST"])
def create_activity(project_id):
    """
    Create a new activity under a project
    ---
    tags:
      - Activities
    parameters:
      - in: path
        name: project_id
        type: integer
        required: true
      - in: body
        name: body
        required: true
        schema:
          $ref: '#/definitions/ActivityInput'
    responses:
      201:
        description: Activity created
        schema:
          $ref: '#/definitions/Activity'
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
        data = activity_schema.load(request.get_json() or {})
    except ValidationError as err:
        return validation_error_response(err.messages)
    activity = activity_service.create_activity(project_id, data)
    if activity is None:
        return not_found_response("Project")
    return jsonify(activity), 201


@activities_bp.route(
    "/projects/<int:project_id>/activities/<int:activity_id>",
    methods=["PUT"],
)
def update_activity(project_id, activity_id):
    """
    Update an activity
    ---
    tags:
      - Activities
    parameters:
      - in: path
        name: project_id
        type: integer
        required: true
      - in: path
        name: activity_id
        type: integer
        required: true
      - in: body
        name: body
        required: true
        schema:
          $ref: '#/definitions/ActivityInput'
    responses:
      200:
        description: Activity updated
        schema:
          $ref: '#/definitions/Activity'
      404:
        description: Activity not found
        schema:
          $ref: '#/definitions/Error'
      422:
        description: Validation error
        schema:
          $ref: '#/definitions/ValidationError'
    """
    try:
        data = activity_schema.load(request.get_json() or {})
    except ValidationError as err:
        return validation_error_response(err.messages)
    activity = activity_service.update_activity(project_id, activity_id, data)
    if activity is None:
        return not_found_response("Activity")
    return jsonify(activity), 200


@activities_bp.route(
    "/projects/<int:project_id>/activities/<int:activity_id>",
    methods=["DELETE"],
)
def delete_activity(project_id, activity_id):
    """
    Delete an activity
    ---
    tags:
      - Activities
    parameters:
      - in: path
        name: project_id
        type: integer
        required: true
      - in: path
        name: activity_id
        type: integer
        required: true
    responses:
      204:
        description: Activity deleted
      404:
        description: Activity not found
        schema:
          $ref: '#/definitions/Error'
    """
    deleted = activity_service.delete_activity(project_id, activity_id)
    if not deleted:
        return not_found_response("Activity")
    return "", 204
