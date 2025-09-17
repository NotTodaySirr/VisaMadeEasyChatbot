from flask import Blueprint, request, jsonify, send_from_directory, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError
import os
import logging

from app.core.extensions import db
from app.db.models import UploadedFile
from app.schemas.file import FileSchema, FileUploadSchema, FileListSchema
from app.middleware.file_validation import (
    validate_file_upload, 
    validate_file_access, 
    log_file_operation,
    check_file_quota
)
from app.core.file_utils import (
    secure_filename_custom,
    get_upload_path,
    ensure_upload_directory,
    delete_file,
    get_file_size,
    get_mime_type
)

logger = logging.getLogger(__name__)

# Create blueprint
files_bp = Blueprint('files', __name__, url_prefix='/files')

# Initialize schemas
file_schema = FileSchema()
file_upload_schema = FileUploadSchema()
file_list_schema = FileListSchema()

@files_bp.route('/upload', methods=['POST'])
@jwt_required()
@validate_file_upload('checklist')
@log_file_operation('upload')
def upload_file():
    """
    Upload a file to the server.
    
    Expected form data:
    - file: The file to upload
    - content_type: Type of content (chat, checklist, profile)
    - description: Optional description
    - tags: Optional tags
    """
    try:
        user_id = get_jwt_identity()
        
        # Get validation data from middleware
        file_data = request.file_validation
        file = file_data['file']
        file_size = file_data['file_size']
        mime_type = file_data['mime_type']
        content_type = file_data['content_type']
        
        # Get additional form data
        description = request.form.get('description', '')
        tags = request.form.get('tags', '')
        
        # Check user quota
        is_within_quota, quota_error = check_file_quota(user_id, file_size)
        if not is_within_quota:
            return jsonify({'error': quota_error}), 413
        
        # Generate secure filename and path
        secure_name = secure_filename_custom(file.filename)
        upload_dir = get_upload_path(user_id, content_type)
        file_path = os.path.join(upload_dir, secure_name)
        
        # Ensure directory exists
        ensure_upload_directory(file_path)
        
        # Save file
        file.save(file_path)
        
        # Verify file was saved correctly
        if not os.path.exists(file_path) or get_file_size(file_path) != file_size:
            return jsonify({'error': 'Failed to save file'}), 500
        
        # Create database record
        uploaded_file = UploadedFile(
            user_id=user_id,
            file_path=file_path,
            original_filename=file.filename,
            file_size=file_size,
            mime_type=mime_type,
            description=description,
            tags=tags,
            content_type=content_type
        )
        
        db.session.add(uploaded_file)
        db.session.commit()
        
        return jsonify({
            'message': 'File uploaded successfully',
            'file': file_schema.dump(uploaded_file)
        }), 201
        
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Database error during file upload: {str(e)}")
        return jsonify({'error': 'Database error occurred'}), 500
    except Exception as e:
        logger.error(f"Unexpected error during file upload: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@files_bp.route('/<int:file_id>', methods=['GET'])
@jwt_required()
@validate_file_access()
@log_file_operation('download')
def download_file(file_id):
    """
    Download a file by ID.
    """
    try:
        user_id = get_jwt_identity()
        
        # Get file from database
        uploaded_file = UploadedFile.query.filter_by(
            id=file_id, 
            user_id=user_id
        ).first()
        
        if not uploaded_file:
            return jsonify({'error': 'File not found'}), 404
        
        # Check if file exists on filesystem
        if not os.path.exists(uploaded_file.file_path):
            return jsonify({'error': 'File not found on server'}), 404
        
        # Send file
        directory = os.path.dirname(uploaded_file.file_path)
        filename = os.path.basename(uploaded_file.file_path)
        
        return send_from_directory(
            directory, 
            filename, 
            as_attachment=True,
            download_name=uploaded_file.original_filename
        )
        
    except Exception as e:
        logger.error(f"Error downloading file {file_id}: {str(e)}")
        return jsonify({'error': 'Error downloading file'}), 500

@files_bp.route('/<int:file_id>', methods=['DELETE'])
@jwt_required()
@validate_file_access()
@log_file_operation('delete')
def delete_file_endpoint(file_id):
    """
    Delete a file by ID.
    """
    try:
        user_id = get_jwt_identity()
        
        # Get file from database
        uploaded_file = UploadedFile.query.filter_by(
            id=file_id, 
            user_id=user_id
        ).first()
        
        if not uploaded_file:
            return jsonify({'error': 'File not found'}), 404
        
        # Delete file from filesystem
        file_deleted = delete_file(uploaded_file.file_path)
        
        # Delete database record
        db.session.delete(uploaded_file)
        db.session.commit()
        
        if not file_deleted:
            logger.warning(f"File {file_id} deleted from database but not from filesystem")
        
        return jsonify({'message': 'File deleted successfully'}), 200
        
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Database error during file deletion: {str(e)}")
        return jsonify({'error': 'Database error occurred'}), 500
    except Exception as e:
        logger.error(f"Error deleting file {file_id}: {str(e)}")
        return jsonify({'error': 'Error deleting file'}), 500

@files_bp.route('/', methods=['GET'])
@jwt_required()
def list_files():
    """
    List user's files with optional filtering and pagination.
    
    Query parameters:
    - content_type: Filter by content type (chat, checklist, profile)
    - page: Page number (default: 1)
    - per_page: Items per page (default: 10, max: 100)
    - search: Search by filename
    """
    try:
        user_id = get_jwt_identity()
        
        # Get query parameters
        content_type = request.args.get('content_type')
        page = int(request.args.get('page', 1))
        per_page = min(int(request.args.get('per_page', 10)), 100)
        search = request.args.get('search', '')
        
        # Build query
        query = UploadedFile.query.filter_by(user_id=user_id)
        
        if content_type:
            query = query.filter_by(content_type=content_type)
        
        if search:
            query = query.filter(UploadedFile.original_filename.contains(search))
        
        # Order by upload date (newest first)
        query = query.order_by(UploadedFile.uploaded_at.desc())
        
        # Paginate
        pagination = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        files = pagination.items
        
        return jsonify({
            'files': [file_schema.dump(file) for file in files],
            'total': pagination.total,
            'page': page,
            'per_page': per_page,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }), 200
        
    except Exception as e:
        logger.error(f"Error listing files: {str(e)}")
        return jsonify({'error': 'Error listing files'}), 500

@files_bp.route('/chat/upload', methods=['POST'])
@jwt_required()
@validate_file_upload('chat')
@log_file_operation('chat_upload')
def upload_chat_file():
    """
    Upload a file for chat purposes.
    This endpoint is prepared for future chat integration.
    """
    try:
        user_id = get_jwt_identity()
        
        # Get validation data from middleware
        file_data = request.file_validation
        file = file_data['file']
        file_size = file_data['file_size']
        mime_type = file_data['mime_type']
        
        # Get additional form data
        description = request.form.get('description', '')
        tags = request.form.get('tags', '')
        
        # Check user quota
        is_within_quota, quota_error = check_file_quota(user_id, file_size)
        if not is_within_quota:
            return jsonify({'error': quota_error}), 413
        
        # Generate secure filename and path
        secure_name = secure_filename_custom(file.filename)
        upload_dir = get_upload_path(user_id, 'chat')
        file_path = os.path.join(upload_dir, secure_name)
        
        # Ensure directory exists
        ensure_upload_directory(file_path)
        
        # Save file
        file.save(file_path)
        
        # Verify file was saved correctly
        if not os.path.exists(file_path) or get_file_size(file_path) != file_size:
            return jsonify({'error': 'Failed to save file'}), 500
        
        # Create database record
        uploaded_file = UploadedFile(
            user_id=user_id,
            file_path=file_path,
            original_filename=file.filename,
            file_size=file_size,
            mime_type=mime_type,
            description=description,
            tags=tags,
            content_type='chat'
        )
        
        db.session.add(uploaded_file)
        db.session.commit()
        
        # Return file info suitable for LLM processing
        return jsonify({
            'message': 'Chat file uploaded successfully',
            'file': {
                'id': uploaded_file.id,
                'filename': uploaded_file.original_filename,
                'size': uploaded_file.file_size,
                'mime_type': uploaded_file.mime_type,
                'description': uploaded_file.description,
                'uploaded_at': uploaded_file.uploaded_at.isoformat() if uploaded_file.uploaded_at else None
            }
        }), 201
        
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Database error during chat file upload: {str(e)}")
        return jsonify({'error': 'Database error occurred'}), 500
    except Exception as e:
        logger.error(f"Unexpected error during chat file upload: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@files_bp.route('/info/<int:file_id>', methods=['GET'])
@jwt_required()
def get_file_info(file_id):
    """
    Get file metadata without downloading the file.
    """
    try:
        user_id = get_jwt_identity()
        
        # Get file from database
        uploaded_file = UploadedFile.query.filter_by(
            id=file_id, 
            user_id=user_id
        ).first()
        
        if not uploaded_file:
            return jsonify({'error': 'File not found'}), 404
        
        return jsonify({
            'file': file_schema.dump(uploaded_file)
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting file info {file_id}: {str(e)}")
        return jsonify({'error': 'Error getting file info'}), 500
