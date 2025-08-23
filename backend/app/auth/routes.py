from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token, jwt_required,
    get_jwt_identity, get_jwt
)
from datetime import datetime, timedelta
from app.core.extensions import db
from app.models.user.user import User
from app.models.auth.token import TokenBlacklist
from app.utils.validators import validate_registration, validate_login
from app.utils.responses import success_response, error_response

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user."""
    try:
        data = request.get_json()
        
        # Validate input data
        is_valid, message = validate_registration(data)
        if not is_valid:
            return error_response(message, 400)
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return error_response('Email already registered', 409)
        
        if User.query.filter_by(username=data['username']).first():
            return error_response('Username already taken', 409)
        
        # Create new user
        user = User(
            email=data['email'],
            username=data['username'],
            yearofbirth=data['yearofbirth'],
            educational_level=data['educational_level']
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Create tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        return success_response(
            'User registered successfully',
            {
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'educational_level': user.educational_level
                },
                'access_token': access_token,
                'refresh_token': refresh_token
            },
            201
        )
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Registration failed: {str(e)}', 500)

@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate user and return tokens."""
    try:
        data = request.get_json()
        
        # Validate input data
        is_valid, message = validate_login(data)
        if not is_valid:
            return error_response(message, 400)
        
        # Find user by email or username
        user = User.query.filter(
            (User.email == data['email']) | (User.username == data['email'])
        ).first()
        
        if not user:
            return error_response('Invalid credentials', 401)
            
        if not user.check_password(data['password']):
            return error_response('Invalid credentials', 401)
        
        # Ensure user.id is accessible before creating tokens
        if not hasattr(user, 'id') or user.id is None:
            return error_response('User data integrity error', 500)
        
        # Create tokens - pass user.id as integer
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        return success_response(
            'Login successful',
            {
                'access_token': access_token,
                'refresh_token': refresh_token,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'educational_level': user.educational_level
                }
            }
        )
        
    except Exception as e:
        return error_response(f'Login failed: {str(e)}', 500)

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user by blacklisting current token."""
    try:
        token = get_jwt()
        jti = token['jti']
        token_type = token['type']
        user_id = get_jwt_identity()
        expires_at = datetime.fromtimestamp(token['exp'])
        
        # Add token to blacklist
        TokenBlacklist.add_token_to_blacklist(
            jti=jti,
            token_type=token_type,
            user_id=user_id,
            expires_at=expires_at
        )
        db.session.commit()
        
        return success_response('Successfully logged out')
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Logout failed: {str(e)}', 500)

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token using refresh token."""
    try:
        current_user_id = get_jwt_identity()
        
        # Ensure we have a valid user ID
        if not current_user_id:
            return error_response('Invalid token identity', 401)
            
        user = User.query.get(current_user_id)
        
        if not user:
            return error_response('User not found', 404)
        
        # Create new access token
        access_token = create_access_token(identity=user.id)
        
        return success_response(
            'Token refreshed successfully',
            {
                'access_token': access_token,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'educational_level': user.educational_level
                }
            }
        )
        
    except Exception as e:
        return error_response(f'Token refresh failed: {str(e)}', 500)

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user information."""
    try:
        current_user_id = get_jwt_identity()
        
        # Ensure we have a valid user ID
        if not current_user_id:
            return error_response('Invalid token identity', 401)
            
        user = User.query.get(current_user_id)
        
        if not user:
            return error_response('User not found', 404)
        
        return success_response(
            'User information retrieved',
            {
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'educational_level': user.educational_level,
                    'yearofbirth': user.yearofbirth
                }
            }
        )
        
    except Exception as e:
        return error_response(f'Failed to get user info: {str(e)}', 500)