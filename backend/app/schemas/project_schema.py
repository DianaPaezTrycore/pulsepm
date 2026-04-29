from marshmallow import Schema, fields, validate


class ProjectSchema(Schema):
    name = fields.String(
        required=True,
        validate=validate.Length(min=1, max=255),
    )
    description = fields.String(allow_none=True, load_default=None)
