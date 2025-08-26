import os
import tempfile
import pytest
from dotenv import load_dotenv

# Load environment variables from .env file BEFORE any app imports
load_dotenv()

# Set test database URL to use SQLite in memory BEFORE importing app
os.environ['TEST_DATABASE_URL'] = 'sqlite:///:memory:'

from app import create_app
from app.core.extensions import db
from app.db.models.user import User
from app.db.models.token import TokenBlacklist

class TestConfig:
    """Test configuration."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = 'test-jwt-secret-key'
    SECRET_KEY = 'test-secret-key'
    WTF_CSRF_ENABLED = False

@pytest.fixture
def app():
    """Create application for testing."""
    app = create_app('testing')
    
    # Override config to ensure SQLite is used
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['TESTING'] = True
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

@pytest.fixture
def client(app):
    """Create test client."""
    return app.test_client()

@pytest.fixture
def runner(app):
    """Create test CLI runner."""
    return app.test_cli_runner()

@pytest.fixture
def test_user(app):
    """Create a test user."""
    user = User(
        email='test@example.com',
        username='testuser',
        yearofbirth=1990,
        educational_level='Bachelor\'s Degree'
    )
    user.set_password('TestPassword123')
    
    db.session.add(user)
    db.session.commit()
    return user

@pytest.fixture
def auth_headers(client, test_user):
    """Get authentication headers for test user."""
    response = client.post('/auth/login', json={
        'email': 'test@example.com',
        'password': 'TestPassword123'
    })
    
    data = response.get_json()
    access_token = data['data']['access_token']
    
    return {'Authorization': f'Bearer {access_token}'}