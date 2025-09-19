from marshmallow import Schema, fields, validate
from app.core.file_utils import get_file_size

class FileSchema(Schema):
    """Schema for file metadata validation and serialization."""
    id = fields.Int(dump_only=True)
    file_path = fields.Str(dump_only=True)
    original_filename = fields.Str(required=True, validate=validate.Length(min=1, max=255))
    file_size = fields.Method('calc_size', dump_only=True)
    mime_type = fields.Str(dump_only=True)
    uploaded_at = fields.DateTime(dump_only=True)
    item_id = fields.Int(dump_only=True)
    # Keep minimal surface; ownership flows via item

    def calc_size(self, obj):
      try:
        size = getattr(obj, 'file_size', 0) or 0
        if size:
          return size
        path = getattr(obj, 'file_path', None)
        return get_file_size(path) if path else 0
      except Exception:
        return 0

class FileUploadSchema(Schema):
    """Schema for file upload requests."""
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
