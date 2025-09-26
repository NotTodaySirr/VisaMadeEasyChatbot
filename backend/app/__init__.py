from flask import Flask, jsonify
from config import config
from app.core.extensions import init_extensions, db, login_manager, jwt
from app.db.models.user import User
from app.db.models.token import TokenBlacklist
from app.api.register import register_blueprints
import os


def create_app(config_name='default'):
    """Create and configure Flask application."""
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    init_extensions(app)
    
    # Configure Flask-Login
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))
    
    # Configure JWT callbacks
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        jti = jwt_payload['jti']
        return TokenBlacklist.is_jti_blacklisted(jti)
    
    @jwt.user_identity_loader
    def user_identity_lookup(user):
        # Handle both User objects and direct integer IDs
        # Always return string for JWT compatibility
        if isinstance(user, int):
            return str(user)
        return str(user.id)
    
    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        from app.core.extensions import db
        identity = jwt_data['sub']
        # Convert string identity back to integer for database lookup
        return db.session.get(User, int(identity))
    
    register_blueprints(app)
    
    # Add custom error handlers
    @app.errorhandler(413)
    def handle_file_too_large(e):
        return jsonify({'error': 'File size exceeds maximum allowed size'}), 413
    
    # Initialize file upload configuration
    with app.app_context():
        # Create upload directories if they don't exist
        upload_folder = app.config.get('UPLOAD_FOLDER', 'uploads')
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder, exist_ok=True)
        
        # Create subdirectories
        for subdir in ['chat', 'checklist', 'profile']:
            subdir_path = os.path.join(upload_folder, subdir)
            if not os.path.exists(subdir_path):
                os.makedirs(subdir_path, exist_ok=True)
        
        # Set file size limits
        app.config['MAX_CONTENT_LENGTH'] = app.config.get('MAX_CONTENT_LENGTH', 16 * 1024 * 1024)
            
    return app