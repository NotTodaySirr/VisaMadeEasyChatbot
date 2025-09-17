import os
import logging
from flask import request, jsonify, current_app
from functools import wraps
from app.core.file_utils import (
    allowed_file, 
    validate_file_size, 
    is_safe_file,
    get_mime_type
)

logger = logging.getLogger(__name__)

def validate_file_upload(content_type: str = 'checklist'):
    """
    Decorator to validate file uploads.
    
    Args:
        content_type: Type of content being uploaded (chat, checklist, profile)
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Check if file is present in request
            if 'file' not in request.files:
                return jsonify({'error': 'No file provided'}), 400
            
            file = request.files['file']
            
            # Check if file is selected
            if file.filename == '':
                return jsonify({'error': 'No file selected'}), 400
            
            # Validate file extension
            if not allowed_file(file.filename, content_type):
                return jsonify({'error': 'File type not allowed'}), 400
            
            # Get file size
            file.seek(0, os.SEEK_END)
            file_size = file.tell()
            file.seek(0)  # Reset file pointer
            
            # Validate file size
            is_valid_size, size_error = validate_file_size(file_size, content_type)
            if not is_valid_size:
                return jsonify({'error': size_error}), 413
            
            # Additional security checks - check for directory traversal in filename
            if '..' in file.filename or '/' in file.filename or '\\' in file.filename:
                logger.warning(f"Potentially unsafe file upload attempt: {file.filename}")
                return jsonify({'error': 'Invalid file'}), 400
            
            # Store validation results in request context for use in route
            request.file_validation = {
                'file': file,
                'file_size': file_size,
                'mime_type': get_mime_type(file.filename),
                'content_type': content_type
            }
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def validate_file_access():
    """
    Decorator to validate file access permissions.
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            file_id = kwargs.get('file_id')
            if not file_id:
                return jsonify({'error': 'File ID required'}), 400
            
            # Additional validation can be added here
            # For now, just pass through
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def log_file_operation(operation: str):
    """
    Decorator to log file operations for security monitoring.
    
    Args:
        operation: Type of operation (upload, download, delete)
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                result = f(*args, **kwargs)
                
                # Log successful operation
                logger.info(f"File {operation} successful: {request.remote_addr}")
                return result
                
            except Exception as e:
                # Log failed operation
                logger.error(f"File {operation} failed: {str(e)} - {request.remote_addr}")
                raise
                
        return decorated_function
    return decorator

def check_file_quota(user_id: int, additional_size: int = 0) -> tuple[bool, str]:
    """
    Check if user has exceeded file storage quota.
    
    Args:
        user_id: ID of the user
        additional_size: Additional size being added in bytes
    
    Returns:
        tuple[bool, str]: (is_within_quota, error_message)
    """
    # This is a placeholder for quota checking
    # In a real implementation, you would check against user's storage limits
    max_quota = current_app.config.get('MAX_USER_STORAGE', 100 * 1024 * 1024)  # 100MB default
    
    # For now, just return True (no quota limits)
    return True, ""

def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename to prevent security issues.
    
    Args:
        filename: Original filename
    
    Returns:
        str: Sanitized filename
    """
    # Remove any path components
    filename = os.path.basename(filename)
    
    # Remove null bytes and other dangerous characters
    dangerous_chars = ['\x00', '..', '/', '\\']
    for char in dangerous_chars:
        filename = filename.replace(char, '')
    
    # Limit length
    if len(filename) > 255:
        name, ext = os.path.splitext(filename)
        filename = name[:255-len(ext)] + ext
    
    return filename
