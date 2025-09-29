from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from app.core.extensions import db
from app.db.models.user import User
from app.schemas.user import UserUpdateSchema
from app.core.utils import success_response, error_response

users_bp = Blueprint('users', __name__, url_prefix='/users')


@users_bp.route('/profile', methods=['PATCH'])
@jwt_required()
def update_user_profile():
    """Update current user profile information (partial updates allowed)."""
    try:
        current_user_id = get_jwt_identity()

        if not current_user_id:
            return error_response('Invalid token identity', 401)

        user = db.session.get(User, current_user_id)

        if not user:
            return error_response('User not found', 404)

        # Get request data
        data = request.get_json()

        if not data:
            return error_response('No data provided', 400)

        # Validate input data using schema
        schema = UserUpdateSchema()
        try:
            validated_data = schema.load(data)
        except ValidationError as e:
            return error_response(
                'Validation failed',
                400,
                {'validation_errors': e.messages}
            )

        # Update only provided fields
        updated_fields = []

        if 'username' in validated_data:
            # Check if new username is already taken
            existing_user = User.query.filter_by(username=validated_data['username']).first()
            if existing_user and existing_user.id != user.id:
                return error_response('Username already taken', 409)
            user.username = validated_data['username']
            updated_fields.append('username')

        if 'email' in validated_data:
            # Check if new email is already registered
            existing_user = User.query.filter_by(email=validated_data['email']).first()
            if existing_user and existing_user.id != user.id:
                return error_response('Email already registered', 409)
            user.email = validated_data['email']
            updated_fields.append('email')

        if 'yearofbirth' in validated_data:
            user.yearofbirth = validated_data['yearofbirth']
            updated_fields.append('yearofbirth')

        if 'educational_level' in validated_data:
            user.educational_level = validated_data['educational_level']
            updated_fields.append('educational_level')

        # If no valid fields were provided for update
        if not updated_fields:
            return error_response('No valid fields provided for update', 400)

        # Commit changes
        db.session.commit()

        return success_response(
            'Profile updated successfully',
            {
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'yearofbirth': user.yearofbirth,
                    'educational_level': user.educational_level
                },
                'updated_fields': updated_fields
            }
        )

    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to update profile: {str(e)}', 500)
