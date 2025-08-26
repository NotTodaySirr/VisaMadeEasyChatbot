from flask import Flask
from config import config
from app.core.extensions import init_extensions, db, login_manager, jwt
from app.models import User, TokenBlacklist

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
        identity = jwt_data['sub']
        # Convert string identity back to integer for database lookup
        return db.session.get(User, int(identity))
    
    # Register blueprints
    from app.auth import auth_bp
    app.register_blueprint(auth_bp)
    
    return app