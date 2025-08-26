# Auth request/response schemas
from marshmallow import Schema, fields, validate

class UserRegistrationSchema(Schema):
    """Schema for user registration requests."""
    email = fields.Email(required=True, validate=validate.Length(min=1, max=120))
    username = fields.Str(required=True, validate=validate.Length(min=3, max=64))
    password = fields.Str(required=True, validate=validate.Length(min=8))
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

class UserLoginSchema(Schema):
    """Schema for user login requests."""
    email = fields.Str(required=True, validate=validate.Length(min=1))
    password = fields.Str(required=True, validate=validate.Length(min=1))

class TokenResponseSchema(Schema):
    """Schema for token responses."""
    access_token = fields.Str(required=True)
    refresh_token = fields.Str(required=True)

class UserResponseSchema(Schema):
    """Schema for user data in responses."""
    id = fields.Int(required=True)
    email = fields.Email(required=True)
    username = fields.Str(required=True)
    educational_level = fields.Str(required=True)
    yearofbirth = fields.Int(required=True)

class AuthResponseSchema(Schema):
    """Schema for authentication responses."""
    user = fields.Nested(UserResponseSchema, required=True)
    access_token = fields.Str(required=True)
    refresh_token = fields.Str(required=True)