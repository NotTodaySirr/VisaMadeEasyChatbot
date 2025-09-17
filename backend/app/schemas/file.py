from marshmallow import Schema, fields, validate

class FileSchema(Schema):
    """Schema for file metadata validation and serialization."""
    id = fields.Int(dump_only=True)
    user_id = fields.Int(dump_only=True)
    file_path = fields.Str(dump_only=True)
    original_filename = fields.Str(required=True, validate=validate.Length(min=1, max=255))
    file_size = fields.Int(required=True, validate=validate.Range(min=1))
    mime_type = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    uploaded_at = fields.DateTime(dump_only=True)
    description = fields.Str(validate=validate.Length(max=500))
    tags = fields.Str(validate=validate.Length(max=200))
    content_type = fields.Str(
        validate=validate.OneOf(['chat', 'checklist', 'profile']),
        load_default='checklist'
    )

class FileUploadSchema(Schema):
    """Schema for file upload requests."""
    content_type = fields.Str(
        validate=validate.OneOf(['chat', 'checklist', 'profile']),
        load_default='checklist'
    )
    description = fields.Str(validate=validate.Length(max=500))
    tags = fields.Str(validate=validate.Length(max=200))

class FileListSchema(Schema):
    """Schema for file listing responses."""
    files = fields.Nested(FileSchema, many=True)
    total = fields.Int(dump_only=True)
    page = fields.Int(dump_only=True)
    per_page = fields.Int(dump_only=True)
    has_next = fields.Bool(dump_only=True)
    has_prev = fields.Bool(dump_only=True)
