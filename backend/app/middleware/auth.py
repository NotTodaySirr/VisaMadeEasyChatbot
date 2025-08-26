from functools import wraps
from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from app.models.user.user import User
from app.utils.responses import error_response
from app.core.extensions import db

def auth_required(f):
    """Decorator to require authentication for routes."""
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        try:
            current_user_id = get_jwt_identity()
            current_user = db.session.get(User, current_user_id)
            
            if not current_user:
                return error_response('User not found', 404)
            
            return f(current_user, *args, **kwargs)
        except Exception as e:
            return error_response(f'Authentication failed: {str(e)}', 401)
    
    return decorated_function

def optional_auth(f):
    """Decorator for optional authentication (user may or may not be logged in)."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request(optional=True)
            current_user_id = get_jwt_identity()
            current_user = None
            
            if current_user_id:
                current_user = db.session.get(User, current_user_id)
            
            return f(current_user, *args, **kwargs)
        except Exception as e:
            # If there's an error with optional auth, continue without user
            return f(None, *args, **kwargs)
    
    return decorated_function

def admin_required(f):
    """Decorator to require admin privileges (for future use)."""
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        try:
            current_user_id = get_jwt_identity()
            current_user = db.session.get(User, current_user_id)
            
            if not current_user:
                return error_response('User not found', 404)
            
            # Note: Admin role logic would be implemented here when roles are added
            # For now, this is a placeholder
            
            return f(current_user, *args, **kwargs)
        except Exception as e:
            return error_response(f'Authorization failed: {str(e)}', 403)
    
    return decorated_function