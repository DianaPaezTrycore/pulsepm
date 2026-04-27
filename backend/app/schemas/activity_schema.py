from marshmallow import Schema, fields, validate

from app.constants import PERCENTAGE_MIN, PERCENTAGE_MAX


class ActivitySchema(Schema):
    name = fields.String(
        required=True,
        validate=validate.Length(min=1, max=255),
    )
    bac = fields.Float(
        required=True,
        validate=validate.Range(min=0, min_inclusive=False),
    )
    planned_progress = fields.Float(
        required=True,
        validate=validate.Range(min=PERCENTAGE_MIN, max=PERCENTAGE_MAX),
    )
    actual_progress = fields.Float(
        required=True,
        validate=validate.Range(min=PERCENTAGE_MIN, max=PERCENTAGE_MAX),
    )
    actual_cost = fields.Float(
        required=True,
        validate=validate.Range(min=0),
    )
