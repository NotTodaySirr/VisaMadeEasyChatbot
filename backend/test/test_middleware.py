import pytest
from flask import Blueprint
from app import create_app
from app.middleware.auth import auth_required, optional_auth, admin_required
from app.models.user.user import User
from app.core.extensions import db

# Create test routes for middleware testing
test_bp = Blueprint('test_middleware', __name__)

@test_bp.route('/protected')
@auth_required
def protected_route(current_user):
    return {'message': f'Hello {current_user.username}', 'user_id': current_user.id}

@test_bp.route('/optional')
@optional_auth
def optional_route(current_user):
    if current_user:
        return {'message': f'Hello {current_user.username}', 'authenticated': True}
    return {'message': 'Hello guest', 'authenticated': False}

@test_bp.route('/admin')
@admin_required
def admin_route(current_user):
    return {'message': f'Admin panel for {current_user.username}'}

class TestAuthMiddleware:
    """Test authentication middleware decorators."""
    
    @pytest.fixture(autouse=True)
    def setup_test_routes(self, app):
        """Register test routes for middleware testing."""
        app.register_blueprint(test_bp, url_prefix='/test')
    
    def test_auth_required_with_valid_token(self, client, auth_headers):
        """Test @auth_required decorator with valid token."""
        response = client.get('/test/protected', headers=auth_headers)
        assert response.status_code == 200
        
        json_data = response.get_json()
        assert 'Hello testuser' in json_data['message']
        assert 'user_id' in json_data
    
    def test_auth_required_without_token(self, client):
        """Test @auth_required decorator without token."""
        response = client.get('/test/protected')
        assert response.status_code == 401
    
    def test_auth_required_with_invalid_token(self, client):
        """Test @auth_required decorator with invalid token."""
        headers = {'Authorization': 'Bearer invalid_token'}
        response = client.get('/test/protected', headers=headers)
        assert response.status_code == 422
    
    def test_optional_auth_with_valid_token(self, client, auth_headers):
        """Test @optional_auth decorator with valid token."""
        response = client.get('/test/optional', headers=auth_headers)
        assert response.status_code == 200
        
        json_data = response.get_json()
        assert 'Hello testuser' in json_data['message']
        assert json_data['authenticated'] is True
    
    def test_optional_auth_without_token(self, client):
        """Test @optional_auth decorator without token."""
        response = client.get('/test/optional')
        assert response.status_code == 200
        
        json_data = response.get_json()
        assert 'Hello guest' in json_data['message']
        assert json_data['authenticated'] is False
    
    def test_optional_auth_with_invalid_token(self, client):
        """Test @optional_auth decorator with invalid token."""
        headers = {'Authorization': 'Bearer invalid_token'}
        response = client.get('/test/optional', headers=headers)
        assert response.status_code == 200
        
        json_data = response.get_json()
        assert 'Hello guest' in json_data['message']
        assert json_data['authenticated'] is False
    
    def test_admin_required_placeholder(self, client, auth_headers):
        """Test @admin_required decorator (placeholder functionality)."""
        response = client.get('/test/admin', headers=auth_headers)
        assert response.status_code == 200
        
        json_data = response.get_json()
        assert 'Admin panel for testuser' in json_data['message']
    
    def test_admin_required_without_token(self, client):
        """Test @admin_required decorator without token."""
        response = client.get('/test/admin')
        assert response.status_code == 401