import os
import uuid
import mimetypes
from werkzeug.utils import secure_filename
from flask import current_app
from typing import Optional, Tuple

def allowed_file(filename: str, content_type: str = 'checklist') -> bool:
    """
    Check if file extension is allowed based on content type.
    
    Args:
        filename: Name of the file to check
        content_type: Type of content (chat, checklist, profile)
    
    Returns:
        bool: True if file extension is allowed
    """
    if not filename or '.' not in filename:
        return False
    
    extension = filename.rsplit('.', 1)[1].lower()
    allowed_extensions = current_app.config.get('ALLOWED_EXTENSIONS', {})
    
    if content_type == 'chat':
        chat_limits = current_app.config.get('CHAT_FILE_LIMITS', {})
        allowed_types = chat_limits.get('allowed_types', ['images', 'documents'])
        allowed_exts = set()
        for file_type in allowed_types:
            allowed_exts.update(allowed_extensions.get(file_type, set()))
        return extension in allowed_exts
    else:
        # For checklist and profile, allow all file types
        all_allowed = set()
        for file_types in allowed_extensions.values():
            all_allowed.update(file_types)
        return extension in all_allowed

def secure_filename_custom(filename: str) -> str:
    """
    Generate a secure filename using werkzeug's secure_filename with UUID prefix.
    
    Args:
        filename: Original filename
    
    Returns:
        str: Secure filename with UUID prefix
    """
    if not filename:
        return str(uuid.uuid4())
    
    # Get secure filename
    secure_name = secure_filename(filename)
    
    # If secure_filename returns empty, use UUID
    if not secure_name:
        secure_name = str(uuid.uuid4())
    
    # Add UUID prefix to prevent conflicts
    name, ext = os.path.splitext(secure_name)
    return f"{uuid.uuid4()}_{name}{ext}"

def get_upload_path(user_id: int, content_type: str = 'checklist', item_id: Optional[int] = None) -> str:
    """
    Generate secure file path for upload.
    
    Args:
        user_id: ID of the user uploading the file
        content_type: Type of content (chat, checklist, profile)
        item_id: Optional item ID for checklist files
    
    Returns:
        str: Path where file should be stored
    """
    upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
    
    if content_type == 'checklist' and item_id:
        # Organize by user and item for checklist files
        return os.path.join(upload_folder, content_type, str(user_id), str(item_id))
    else:
        # Organize by user for other content types
        return os.path.join(upload_folder, content_type, str(user_id))

def ensure_upload_directory(file_path: str) -> None:
    """
    Ensure the upload directory exists.
    
    Args:
        file_path: Full path where file will be stored
    """
    directory = os.path.dirname(file_path)
    os.makedirs(directory, exist_ok=True)

def get_file_size(file_path: str) -> int:
    """
    Get file size in bytes.
    
    Args:
        file_path: Path to the file
    
    Returns:
        int: File size in bytes, 0 if file doesn't exist
    """
    try:
        return os.path.getsize(file_path)
    except (OSError, FileNotFoundError):
        return 0

def get_mime_type(filename: str) -> str:
    """
    Get MIME type for a file.
    
    Args:
        filename: Name of the file
    
    Returns:
        str: MIME type
    """
    mime_type, _ = mimetypes.guess_type(filename)
    return mime_type or 'application/octet-stream'

def delete_file(file_path: str) -> bool:
    """
    Safely delete a file from the filesystem.
    
    Args:
        file_path: Path to the file to delete
    
    Returns:
        bool: True if file was deleted successfully
    """
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False
    except (OSError, PermissionError):
        return False

def validate_file_size(file_size: int, content_type: str = 'checklist') -> Tuple[bool, str]:
    """
    Validate file size against limits.
    
    Args:
        file_size: Size of the file in bytes
        content_type: Type of content (chat, checklist, profile)
    
    Returns:
        Tuple[bool, str]: (is_valid, error_message)
    """
    max_size = current_app.config.get('MAX_CONTENT_LENGTH', 16 * 1024 * 1024)
    
    if content_type == 'chat':
        chat_limits = current_app.config.get('CHAT_FILE_LIMITS', {})
        max_size = chat_limits.get('max_size', max_size)
    
    if file_size > max_size:
        max_mb = max_size // (1024 * 1024)
        return False, f"File size exceeds maximum allowed size of {max_mb}MB"
    
    return True, ""

def is_safe_file(file_path: str) -> bool:
    """
    Basic security check for uploaded files.
    
    Args:
        file_path: Path to the file
    
    Returns:
        bool: True if file appears safe
    """
    # Check for directory traversal attempts
    if '..' in file_path:
        return False
    
    # Check if file is within upload directory
    upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
    abs_upload_folder = os.path.abspath(upload_folder)
    abs_file_path = os.path.abspath(file_path)
    
    return abs_file_path.startswith(abs_upload_folder)

def check_file_quota(user_id: int, file_size: int) -> Tuple[bool, str]:
    """
    Check if user is within file quota limits.
    
    Args:
        user_id: ID of the user
        file_size: Size of the file to be uploaded
    
    Returns:
        Tuple[bool, str]: (is_within_quota, error_message)
    """
    # For now, implement basic quota checking
    # In production, this would check against database records
    max_files_per_user = current_app.config.get('MAX_FILES_PER_USER', 100)
    max_total_size = current_app.config.get('MAX_TOTAL_SIZE_PER_USER', 100 * 1024 * 1024)  # 100MB
    
    # This is a placeholder implementation
    # In a real app, you'd query the database for user's current file count and total size
    return True, ""
