from flask import Blueprint, request, current_app
from flask_jwt_extended import (
    create_access_token, create_refresh_token, jwt_required,
    get_jwt_identity, get_jwt
)
from datetime import datetime, timedelta
from sqlalchemy import func

from app.core.extensions import db
from app.db.models.user import User
from app.db.models.token import TokenBlacklist
from app.services.password_reset_service import (
    build_and_send_reset_email,
    verify_reset_token,
)
from app.core.utils import (
    validate_registration,
    validate_login,
    success_response,
    error_response,
    validate_email,
    validate_password,
)

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
            
        user = db.session.get(User, current_user_id)
        
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

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change user password."""
    try:
        current_user_id = get_jwt_identity()

        if not current_user_id:
            return error_response('Invalid token identity', 401)

        user = db.session.get(User, current_user_id)

        if not user:
            return error_response('User not found', 404)

        data = request.get_json()

        if not data:
            return error_response('No data provided', 400)

        # Validate required fields
        if not data.get('current_password'):
            return error_response('Current password is required', 400)

        if not data.get('new_password'):
            return error_response('New password is required', 400)

        # Verify current password
        if not user.check_password(data['current_password']):
            return error_response('Current password is incorrect', 401)

        # Validate new password strength (basic check)
        new_password = data['new_password']
        if len(new_password) < 8:
            return error_response('New password must be at least 8 characters long', 400)

        # Set new password
        user.set_password(new_password)
        db.session.commit()

        return success_response('Password changed successfully')

    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to change password: {str(e)}', 500)



@auth_bp.route('/password-reset-request', methods=['POST'])
def password_reset_request():
    """Send a password reset link to the user's registered email."""
    try:
        data = request.get_json() or {}
        email = (data.get('email') or '').strip()

        # Validate email is provided
        if not email:
            return error_response('Email is required', 400)

        # Validate email format
        if not validate_email(email):
            return error_response('Invalid email format', 400)

        # Normalize email for database lookup
        normalized_email = email.lower()

        # Check if user exists in database
        user = User.query.filter(func.lower(User.email) == normalized_email).first()

        if not user:
            return error_response(
                'No account found with this email address. Please check your email or register for a new account.',
                404
            )

        # User exists, proceed with password reset
        try:
            build_and_send_reset_email(user)
            db.session.commit()
            return success_response(
                'Password reset instructions have been sent to your email address.',
                {
                    'email': user.email,
                    'expires_in_minutes': current_app.config.get('PASSWORD_RESET_TOKEN_EXPIRATION_MINUTES', 30)
                }
            )

        except Exception as exc:
            db.session.rollback()
            current_app.logger.exception('Failed to create password reset token for %s', email)
            return error_response(
                'Failed to send password reset email. Please try again later or contact support if the problem persists.',
                500
            )

    except Exception as e:
        current_app.logger.exception('Unexpected error in password reset request')
        return error_response(
            'An unexpected error occurred while processing your request. Please try again later.',
            500
        )


@auth_bp.route('/password-reset/validate', methods=['GET'])
def password_reset_validate():
    """Validate that a password reset token is active."""
    token = (request.args.get('token') or '').strip()

    if not token:
        return error_response('Reset token is required', 400)

    reset_token = verify_reset_token(token)
    if not reset_token:
        return error_response('Invalid or expired password reset token', 400)

    return success_response(
        'Password reset token is valid.',
        {
            'email': reset_token.user.email,
            'expires_at': reset_token.expires_at.isoformat(),
        }
    )


@auth_bp.route('/password-reset', methods=['POST'])
def password_reset_complete():
    """Update the user's password after validating a reset token."""
    data = request.get_json() or {}
    token = (data.get('token') or '').strip()
    new_password = (data.get('password') or '').strip()
    confirm_password = data.get('confirm_password')

    if not token:
        return error_response('Reset token is required', 400)

    if not new_password:
        return error_response('New password is required', 400)

    if confirm_password is not None and confirm_password.strip() != new_password:
        return error_response('Passwords do not match', 400)

    is_valid, validation_message = validate_password(new_password)
    if not is_valid:
        return error_response(validation_message, 400)

    reset_token = verify_reset_token(token)
    if not reset_token:
        return error_response('Invalid or expired password reset token', 400)

    try:
        user = reset_token.user
        user.set_password(new_password)
        reset_token.mark_consumed()
        db.session.commit()
    except Exception as exc:  # pragma: no cover - depends on DB/env
        db.session.rollback()
        current_app.logger.exception('Failed to reset password for %s', reset_token.user.email)
        return error_response('Failed to reset password', 500)

    return success_response('Password has been reset successfully.')
