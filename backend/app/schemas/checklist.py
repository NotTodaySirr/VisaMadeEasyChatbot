from marshmallow import Schema, fields, validate

class ItemSchema(Schema):
    id = fields.Int(dump_only=True)
    title = fields.Str(required=True, validate=validate.Length(min=1, max=255))
    description = fields.Str(validate=validate.Length(max=2048))
    deadline = fields.Date(allow_none=True)
    is_completed = fields.Bool(load_default=False)
    category_id = fields.Int(dump_only=True)

class CategorySchema(Schema):
    id = fields.Int(dump_only=True)
    title = fields.Str(required=True, validate=validate.Length(min=1, max=255))
    items = fields.Nested(ItemSchema, many=True, dump_only=True)
    checklist_id = fields.Int(dump_only=True)

class ChecklistSchema(Schema):
    id = fields.Int(dump_only=True)
    user_id = fields.Int(dump_only=True)
    title = fields.Str(required=True, validate=validate.Length(min=1, max=255))
    overall_deadline = fields.Date(allow_none=True)
    created_at = fields.DateTime(dump_only=True)
    categories = fields.Nested(CategorySchema, many=True, dump_only=True)
