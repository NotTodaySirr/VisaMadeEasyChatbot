from flask import jsonify
import re
from datetime import datetime

def success_response(message, data=None, status_code=200):
    """Create a standardized success response."""
    response = {
        'success': True,
        'message': message
    }
    
    if data is not None:
        response['data'] = data
    
    return jsonify(response), status_code

def error_response(message, status_code=400, errors=None):
    """Create a standardized error response."""
    response = {
        'success': False,
        'message': message
    }
    
    if errors is not None:
        response['errors'] = errors
    
    return jsonify(response), status_code

def validation_error_response(errors):
    """Create a response for validation errors."""
    return error_response(
        'Validation failed',
        status_code=400,
        errors=errors
    )

# Validation functions
def validate_email(email):
    """Validate email format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Validate password strength."""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    
    if not re.search(r'\d', password):
        return False, "Password must contain at least one number"
    
    return True, "Password is valid"

def validate_username(username):
    """Validate username format."""
    if len(username) < 3 or len(username) > 20:
        return False, "Username must be between 3 and 20 characters"
    
    if not re.match(r'^[a-zA-Z0-9_]+$', username):
        return False, "Username can only contain letters, numbers, and underscores"
    
    return True, "Username is valid"

def validate_year_of_birth(year):
    """Validate year of birth."""
    current_year = datetime.now().year
    
    if not isinstance(year, int):
        return False, "Year of birth must be a number"
    
    if year < 1900 or year > current_year - 13:
        return False, "Invalid year of birth"
    
    return True, "Year of birth is valid"

def validate_educational_level(level):
    """Validate educational level."""
    valid_levels = [
        'High School',
        'Associate Degree',
        'Bachelor\'s Degree',
        'Master\'s Degree',
        'Doctorate',
        'Other'
    ]
    
    if level not in valid_levels:
        return False, f"Educational level must be one of: {', '.join(valid_levels)}"
    
    return True, "Educational level is valid"

def validate_registration(data):
    """Validate registration data."""
    if not data:
        return False, "No data provided"
    
    required_fields = ['email', 'username', 'password', 'yearofbirth', 'educational_level']
    
    # Check required fields
    for field in required_fields:
        if field not in data or not data[field]:
            return False, f"{field} is required"
    
    # Validate email
    if not validate_email(data['email']):
        return False, "Invalid email format"
    
    # Validate username
    is_valid, message = validate_username(data['username'])
    if not is_valid:
        return False, message
    
    # Validate password
    is_valid, message = validate_password(data['password'])
    if not is_valid:
        return False, message
    
    # Validate year of birth
    is_valid, message = validate_year_of_birth(data['yearofbirth'])
    if not is_valid:
        return False, message
    
    # Validate educational level
    is_valid, message = validate_educational_level(data['educational_level'])
    if not is_valid:
        return False, message
    
    return True, "All data is valid"

def validate_login(data):
    """Validate login data."""
    if not data:
        return False, "No data provided"
    
    # Accept both 'email' and 'login' as field names for backward compatibility
    email_field = 'email' if 'email' in data else 'login'
    required_fields = [email_field, 'password']
    
    # Check required fields
    for field in required_fields:
        if field not in data or not data[field]:
            return False, f"{field} is required"
    
    # Basic validation for email field
    if len(data[email_field]) < 3:
        return False, "Email must be at least 3 characters long"
    
    # Basic validation for password
    if len(data['password']) < 1:
        return False, "Password is required"
    
    return True, "Login data is valid"