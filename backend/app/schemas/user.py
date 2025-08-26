# User schemas for request/response validation
from marshmallow import Schema, fields, validate

class UserProfileSchema(Schema):
    """Schema for user profile data."""
    id = fields.Int(dump_only=True)
    email = fields.Email(required=True, validate=validate.Length(max=120))
    username = fields.Str(required=True, validate=validate.Length(min=3, max=64))
    yearofbirth = fields.Int(required=True, validate=validate.Range(min=1900, max=2024))
    educational_level = fields.Str(
        required=True,
        validate=validate.OneOf([
            'High School',
            'Associate Degree',
            'Bachelor\'s Degree',
            'Master\'s Degree',
            'Doctorate',
            'Other'
        ])
    )

class UserUpdateSchema(Schema):
    """Schema for user profile updates."""
    email = fields.Email(validate=validate.Length(max=120))
    username = fields.Str(validate=validate.Length(min=3, max=64))
    yearofbirth = fields.Int(validate=validate.Range(min=1900, max=2024))
    educational_level = fields.Str(
        validate=validate.OneOf([
            'High School',
            'Associate Degree',
            'Bachelor\'s Degree',
            'Master\'s Degree',
            'Doctorate',
            'Other'
        ])
    )

class PasswordChangeSchema(Schema):
    """Schema for password change requests."""
    current_password = fields.Str(required=True, validate=validate.Length(min=1))
    new_password = fields.Str(required=True, validate=validate.Length(min=8))
    confirm_password = fields.Str(required=True, validate=validate.Length(min=8))