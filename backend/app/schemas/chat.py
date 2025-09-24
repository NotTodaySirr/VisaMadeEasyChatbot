"""Marshmallow schemas for chat API validation."""
from marshmallow import Schema, fields, validate


class MessageSchema(Schema):
    """Schema for message validation."""
    id = fields.Int(dump_only=True)
    conversation_id = fields.Int(required=True)
    content = fields.Str(required=True, validate=validate.Length(min=1, max=10000))
    role = fields.Str(required=True, validate=validate.OneOf(['user', 'assistant']))
    status = fields.Str(dump_only=True)
    timestamp = fields.DateTime(dump_only=True)
    parent_message_id = fields.Int(allow_none=True)


class ConversationSchema(Schema):
    """Schema for conversation validation."""
    id = fields.Int(dump_only=True)
    user_id = fields.Int(dump_only=True)
    title = fields.Str(required=True, validate=validate.Length(min=1, max=255))
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    pinned = fields.Bool(dump_only=False, missing=False)
    pinned_at = fields.DateTime(allow_none=True, dump_only=True)


class SendMessageSchema(Schema):
    """Schema for sending messages."""
    content = fields.Str(required=True, validate=validate.Length(min=1, max=10000))
    conversation_id = fields.Int(required=False, allow_none=True)


class CreateConversationSchema(Schema):
    """Schema for creating conversations."""
    title = fields.Str(required=True, validate=validate.Length(min=1, max=255))
