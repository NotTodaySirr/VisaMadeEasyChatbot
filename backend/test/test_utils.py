import pytest
from app.utils.validators import (
    validate_email, validate_password, validate_username,
    validate_year_of_birth, validate_educational_level,
    validate_registration, validate_login
)
from app.utils.responses import success_response, error_response, validation_error_response

class TestValidators:
    """Test validation utility functions."""
    
    def test_validate_email_valid(self):
        """Test email validation with valid emails."""
        valid_emails = [
            'test@example.com',
            'user.name@domain.co.uk',
            'user+tag@example.org',
            'user123@test-domain.com'
        ]
        
        for email in valid_emails:
            assert validate_email(email) is True
    
    def test_validate_email_invalid(self):
        """Test email validation with invalid emails."""
        invalid_emails = [
            'invalid-email',
            '@domain.com',
            'user@',
            'user@.com',
            'user space@domain.com',
            ''
        ]
        
        for email in invalid_emails:
            assert validate_email(email) is False
    
    def test_validate_password_valid(self):
        """Test password validation with valid passwords."""
        valid_passwords = [
            'Password123',
            'MySecurePass1',
            'Test@Password2'
        ]
        
        for password in valid_passwords:
            is_valid, message = validate_password(password)
            assert is_valid is True
            assert message == "Password is valid"
    
    def test_validate_password_too_short(self):
        """Test password validation with short passwords."""
        is_valid, message = validate_password('Pass1')
        assert is_valid is False
        assert 'at least 8 characters' in message
    
    def test_validate_password_no_uppercase(self):
        """Test password validation without uppercase."""
        is_valid, message = validate_password('password123')
        assert is_valid is False
        assert 'uppercase letter' in message
    
    def test_validate_password_no_lowercase(self):
        """Test password validation without lowercase."""
        is_valid, message = validate_password('PASSWORD123')
        assert is_valid is False
        assert 'lowercase letter' in message
    
    def test_validate_password_no_number(self):
        """Test password validation without numbers."""
        is_valid, message = validate_password('Password')
        assert is_valid is False
        assert 'number' in message
    
    def test_validate_username_valid(self):
        """Test username validation with valid usernames."""
        valid_usernames = ['user123', 'test_user', 'username', 'User_Name_123']
        
        for username in valid_usernames:
            is_valid, message = validate_username(username)
            assert is_valid is True
            assert message == "Username is valid"
    
    def test_validate_username_too_short(self):
        """Test username validation with short username."""
        is_valid, message = validate_username('ab')
        assert is_valid is False
        assert 'between 3 and 20 characters' in message
    
    def test_validate_username_too_long(self):
        """Test username validation with long username."""
        is_valid, message = validate_username('a' * 21)
        assert is_valid is False
        assert 'between 3 and 20 characters' in message
    
    def test_validate_username_invalid_characters(self):
        """Test username validation with invalid characters."""
        invalid_usernames = ['user-name', 'user name', 'user@name', 'user.name']
        
        for username in invalid_usernames:
            is_valid, message = validate_username(username)
            assert is_valid is False
            assert 'letters, numbers, and underscores' in message
    
    def test_validate_year_of_birth_valid(self):
        """Test year of birth validation with valid years."""
        valid_years = [1990, 2000, 2010]
        
        for year in valid_years:
            is_valid, message = validate_year_of_birth(year)
            assert is_valid is True
            assert message == "Year of birth is valid"
    
    def test_validate_year_of_birth_too_old(self):
        """Test year of birth validation with too old year."""
        is_valid, message = validate_year_of_birth(1899)
        assert is_valid is False
        assert 'Invalid year of birth' in message
    
    def test_validate_year_of_birth_too_young(self):
        """Test year of birth validation with too recent year."""
        from datetime import datetime
        current_year = datetime.now().year
        
        is_valid, message = validate_year_of_birth(current_year - 5)
        assert is_valid is False
        assert 'Invalid year of birth' in message
    
    def test_validate_year_of_birth_invalid_type(self):
        """Test year of birth validation with invalid type."""
        is_valid, message = validate_year_of_birth('1990')
        assert is_valid is False
        assert 'must be a number' in message
    
    def test_validate_educational_level_valid(self):
        """Test educational level validation with valid levels."""
        valid_levels = [
            'High School',
            'Associate Degree',
            'Bachelor\'s Degree',
            'Master\'s Degree',
            'Doctorate',
            'Other'
        ]
        
        for level in valid_levels:
            is_valid, message = validate_educational_level(level)
            assert is_valid is True
            assert message == "Educational level is valid"
    
    def test_validate_educational_level_invalid(self):
        """Test educational level validation with invalid level."""
        is_valid, message = validate_educational_level('Invalid Level')
        assert is_valid is False
        assert 'must be one of' in message
    
    def test_validate_registration_complete(self):
        """Test complete registration validation."""
        valid_data = {
            'email': 'test@example.com',
            'username': 'testuser',
            'password': 'TestPassword123',
            'yearofbirth': 1990,
            'educational_level': 'Bachelor\'s Degree'
        }
        
        is_valid, message = validate_registration(valid_data)
        assert is_valid is True
        assert message == "All data is valid"
    
    def test_validate_registration_missing_fields(self):
        """Test registration validation with missing fields."""
        incomplete_data = {
            'email': 'test@example.com',
            'username': 'testuser'
            # Missing password, yearofbirth, educational_level
        }
        
        is_valid, message = validate_registration(incomplete_data)
        assert is_valid is False
        assert 'is required' in message
    
    def test_validate_login_complete(self):
        """Test complete login validation."""
        valid_data = {
            'login': 'test@example.com',
            'password': 'password123'
        }
        
        is_valid, message = validate_login(valid_data)
        assert is_valid is True
        assert message == "Login data is valid"
    
    def test_validate_login_missing_fields(self):
        """Test login validation with missing fields."""
        incomplete_data = {
            'login': 'test@example.com'
            # Missing password
        }
        
        is_valid, message = validate_login(incomplete_data)
        assert is_valid is False
        assert 'is required' in message

class TestResponses:
    """Test response utility functions."""
    
    def test_success_response_basic(self, app):
        """Test basic success response."""
        with app.app_context():
            response, status_code = success_response('Operation successful')
            
            assert status_code == 200
            json_data = response.get_json()
            assert json_data['success'] is True
            assert json_data['message'] == 'Operation successful'
            assert 'data' not in json_data
    
    def test_success_response_with_data(self, app):
        """Test success response with data."""
        with app.app_context():
            test_data = {'user_id': 1, 'username': 'testuser'}
            response, status_code = success_response('User found', test_data, 201)
            
            assert status_code == 201
            json_data = response.get_json()
            assert json_data['success'] is True
            assert json_data['message'] == 'User found'
            assert json_data['data'] == test_data
    
    def test_error_response_basic(self, app):
        """Test basic error response."""
        with app.app_context():
            response, status_code = error_response('Something went wrong')
            
            assert status_code == 400
            json_data = response.get_json()
            assert json_data['success'] is False
            assert json_data['message'] == 'Something went wrong'
            assert 'errors' not in json_data
    
    def test_error_response_with_errors(self, app):
        """Test error response with detailed errors."""
        with app.app_context():
            errors = {'email': ['Invalid format'], 'password': ['Too weak']}
            response, status_code = error_response('Validation failed', 422, errors)
            
            assert status_code == 422
            json_data = response.get_json()
            assert json_data['success'] is False
            assert json_data['message'] == 'Validation failed'
            assert json_data['errors'] == errors
    
    def test_validation_error_response(self, app):
        """Test validation error response."""
        with app.app_context():
            errors = {'username': ['Already taken']}
            response, status_code = validation_error_response(errors)
            
            assert status_code == 400
            json_data = response.get_json()
            assert json_data['success'] is False
            assert json_data['message'] == 'Validation failed'
            assert json_data['errors'] == errors