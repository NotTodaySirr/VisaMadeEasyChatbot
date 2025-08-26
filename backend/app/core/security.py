# Security utilities
import secrets
import hashlib
from functools import wraps
from datetime import datetime, timedelta
from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

def generate_secure_token(length=32):
    """Generate a cryptographically secure random token."""
    return secrets.token_urlsafe(length)

def generate_secret_key(length=32):
    """Generate a secure secret key for Flask applications."""
    return secrets.token_hex(length)

def hash_string(text):
    """Create a SHA-256 hash of the given text."""
    return hashlib.sha256(text.encode('utf-8')).hexdigest()

def rate_limit_decorator(max_requests=100, window_minutes=60):
    """
    Simple rate limiting decorator (placeholder for future implementation).
    In production, use Redis or similar for distributed rate limiting.
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Rate limiting logic would go here
            # For now, this is a placeholder
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def validate_request_signature(secret_key):
    """
    Validate request signature for webhook endpoints.
    Placeholder for future webhook validation.
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Signature validation logic would go here
            return f(*args, **kwargs)
        return decorated_function
    return decorator