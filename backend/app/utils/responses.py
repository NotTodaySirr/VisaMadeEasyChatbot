from flask import jsonify

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