import pytest
import json
from app.models.user.user import User
from app.models.auth.token import TokenBlacklist
from app.core.extensions import db

class TestAuthRegistration:
    """Test user registration endpoint."""
    
    def test_successful_registration(self, client):
        """Test successful user registration."""
        data = {
            'email': 'newuser@example.com',
            'username': 'newuser',
            'password': 'NewPassword123',
            'yearofbirth': 1995,
            'educational_level': 'Master\'s Degree'
        }
        
        response = client.post('/auth/register', json=data)
        assert response.status_code == 201
        
        json_data = response.get_json()
        assert json_data['success'] is True
        assert json_data['message'] == 'User registered successfully'
        assert 'access_token' in json_data['data']
        assert 'refresh_token' in json_data['data']
        assert json_data['data']['user']['email'] == 'newuser@example.com'
    
    def test_duplicate_email_registration(self, client, test_user):
        """Test registration with existing email."""
        data = {
            'email': 'test@example.com',  # Already exists
            'username': 'differentuser',
            'password': 'Password123',
            'yearofbirth': 1990,
            'educational_level': 'Bachelor\'s Degree'
        }
        
        response = client.post('/auth/register', json=data)
        assert response.status_code == 409
        
        json_data = response.get_json()
        assert json_data['success'] is False
        assert 'already registered' in json_data['message']
    
    def test_duplicate_username_registration(self, client, test_user):
        """Test registration with existing username."""
        data = {
            'email': 'different@example.com',
            'username': 'testuser',  # Already exists
            'password': 'Password123',
            'yearofbirth': 1990,
            'educational_level': 'Bachelor\'s Degree'
        }
        
        response = client.post('/auth/register', json=data)
        assert response.status_code == 409
        
        json_data = response.get_json()
        assert json_data['success'] is False
        assert 'already taken' in json_data['message']
    
    def test_invalid_email_registration(self, client):
        """Test registration with invalid email."""
        data = {
            'email': 'invalid-email',
            'username': 'newuser',
            'password': 'Password123',
            'yearofbirth': 1990,
            'educational_level': 'Bachelor\'s Degree'
        }
        
        response = client.post('/auth/register', json=data)
        assert response.status_code == 400
        
        json_data = response.get_json()
        assert json_data['success'] is False
        assert 'Invalid email format' in json_data['message']
    
    def test_weak_password_registration(self, client):
        """Test registration with weak password."""
        data = {
            'email': 'user@example.com',
            'username': 'newuser',
            'password': 'weak',  # Too weak
            'yearofbirth': 1990,
            'educational_level': 'Bachelor\'s Degree'
        }
        
        response = client.post('/auth/register', json=data)
        assert response.status_code == 400
        
        json_data = response.get_json()
        assert json_data['success'] is False
        assert 'Password must be at least 8 characters' in json_data['message']

class TestAuthLogin:
    """Test user login endpoint."""
    
    def test_successful_login_with_email(self, client, test_user):
        """Test successful login using email."""
        data = {
            'email': 'test@example.com',
            'password': 'TestPassword123'
        }
        
        response = client.post('/auth/login', json=data)
        assert response.status_code == 200
        
        json_data = response.get_json()
        assert json_data['success'] is True
        assert json_data['message'] == 'Login successful'
        assert 'access_token' in json_data['data']
        assert 'refresh_token' in json_data['data']
        assert json_data['data']['user']['email'] == 'test@example.com'
    
    def test_successful_login_with_username(self, client, test_user):
        """Test successful login using username."""
        data = {
            'email': 'testuser',
            'password': 'TestPassword123'
        }
        
        response = client.post('/auth/login', json=data)
        assert response.status_code == 200
        
        json_data = response.get_json()
        assert json_data['success'] is True
        assert json_data['data']['user']['username'] == 'testuser'
    
    def test_login_with_wrong_password(self, client, test_user):
        """Test login with incorrect password."""
        data = {
            'email': 'test@example.com',
            'password': 'WrongPassword'
        }
        
        response = client.post('/auth/login', json=data)
        assert response.status_code == 401
        
        json_data = response.get_json()
        assert json_data['success'] is False
        assert 'Invalid credentials' in json_data['message']
    
    def test_login_with_nonexistent_user(self, client):
        """Test login with non-existent user."""
        data = {
            'email': 'nonexistent@example.com',
            'password': 'Password123'
        }
        
        response = client.post('/auth/login', json=data)
        assert response.status_code == 401
        
        json_data = response.get_json()
        assert json_data['success'] is False
        assert 'Invalid credentials' in json_data['message']

class TestAuthLogout:
    """Test user logout endpoint."""
    
    def test_successful_logout(self, client, auth_headers):
        """Test successful logout."""
        response = client.post('/auth/logout', headers=auth_headers)
        assert response.status_code == 200
        
        json_data = response.get_json()
        assert json_data['success'] is True
        assert 'Successfully logged out' in json_data['message']
    
    def test_logout_without_token(self, client):
        """Test logout without authentication token."""
        response = client.post('/auth/logout')
        assert response.status_code == 401

class TestAuthRefresh:
    """Test token refresh endpoint."""
    
    def test_successful_token_refresh(self, client, test_user):
        """Test successful token refresh."""
        # Login to get refresh token
        login_response = client.post('/auth/login', json={
            'email': 'test@example.com',
            'password': 'TestPassword123'
        })
        
        login_data = login_response.get_json()
        refresh_token = login_data['data']['refresh_token']
        
        # Use refresh token
        refresh_headers = {'Authorization': f'Bearer {refresh_token}'}
        response = client.post('/auth/refresh', headers=refresh_headers)
        
        assert response.status_code == 200
        json_data = response.get_json()
        assert json_data['success'] is True
        assert 'access_token' in json_data['data']
    
    def test_refresh_with_access_token(self, client, auth_headers):
        """Test refresh using access token (should fail)."""
        response = client.post('/auth/refresh', headers=auth_headers)
        assert response.status_code == 422  # Unprocessable Entity

class TestAuthMe:
    """Test get current user endpoint."""
    
    def test_get_current_user_success(self, client, auth_headers, test_user):
        """Test successful retrieval of current user info."""
        response = client.get('/auth/me', headers=auth_headers)
        assert response.status_code == 200
        
        json_data = response.get_json()
        assert json_data['success'] is True
        assert json_data['data']['user']['email'] == 'test@example.com'
        assert json_data['data']['user']['username'] == 'testuser'
    
    def test_get_current_user_without_token(self, client):
        """Test get current user without authentication."""
        response = client.get('/auth/me')
        assert response.status_code == 401

class TestTokenBlacklist:
    """Test token blacklisting functionality."""
    
    def test_blacklisted_token_rejection(self, client, test_user):
        """Test that blacklisted tokens are rejected."""
        # Login
        login_response = client.post('/auth/login', json={
            'email': 'test@example.com',
            'password': 'TestPassword123'
        })
        
        login_data = login_response.get_json()
        access_token = login_data['data']['access_token']
        auth_headers = {'Authorization': f'Bearer {access_token}'}
        
        # Access protected endpoint (should work)
        response = client.get('/auth/me', headers=auth_headers)
        assert response.status_code == 200
        
        # Logout (blacklist token)
        logout_response = client.post('/auth/logout', headers=auth_headers)
        assert logout_response.status_code == 200
        
        # Try to access protected endpoint again (should fail)
        response = client.get('/auth/me', headers=auth_headers)
        assert response.status_code == 401  # Token is blacklisted

class TestValidation:
    """Test input validation."""
    
    def test_missing_required_fields_registration(self, client):
        """Test registration with missing required fields."""
        data = {
            'email': 'test@example.com',
            # Missing username, password, etc.
        }
        
        response = client.post('/auth/register', json=data)
        assert response.status_code == 400
        
        json_data = response.get_json()
        assert json_data['success'] is False
    
    def test_missing_required_fields_login(self, client):
        """Test login with missing required fields."""
        data = {
            'email': 'test@example.com',
            # Missing password
        }
        
        response = client.post('/auth/login', json=data)
        assert response.status_code == 400
        
        json_data = response.get_json()
        assert json_data['success'] is False