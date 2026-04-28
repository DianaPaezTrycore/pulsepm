from flask import jsonify


def validation_error_response(messages):
    return jsonify({
        "error": "Validation error",
        "details": messages,
        "code": 422,
    }), 422


def not_found_response(resource):
    return jsonify({
        "error": f"{resource} not found",
        "code": 404,
    }), 404
