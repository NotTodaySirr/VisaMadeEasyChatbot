from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.core.extensions import db
from app.db.models.checklist import Checklist, Category, Item
from app.db.models.file import UploadedFile
from app.schemas.checklist import ChecklistSchema, CategorySchema, ItemSchema
from sqlalchemy.orm import joinedload, subqueryload
from sqlalchemy.sql import func
from app.schemas.file import FileSchema
from app.middleware.file_validation import validate_file_upload, log_file_operation
from app.core.file_utils import (
    secure_filename_custom,
    get_upload_path,
    ensure_upload_directory,
    get_file_size,
    get_mime_type,
    check_file_quota,
    delete_file as fs_delete_file,
    rename_file as fs_rename_file,
)
from werkzeug.utils import secure_filename
from marshmallow import ValidationError
import os
import logging

logger = logging.getLogger(__name__)

checklists_bp = Blueprint('checklists', __name__, url_prefix='/checklists')

checklist_schema = ChecklistSchema()
checklists_schema = ChecklistSchema(many=True)
category_schema = CategorySchema()
categories_schema = CategorySchema(many=True)
item_schema = ItemSchema()
items_schema = ItemSchema(many=True)

# Helper function for user authorization
def authorize_user_for_checklist(checklist_id, user_id):
    checklist = Checklist.query.filter_by(id=checklist_id, user_id=user_id).first()
    if not checklist:
        return None
    return checklist

# Checklist routes
@checklists_bp.route('/', methods=['POST'])
@jwt_required()
def create_checklist():
    """
    Create a new checklist for the authenticated user.

    Request (application/json):
    {
      "title": "My Visa Checklist",
      "overall_deadline": "2025-12-31"  # optional, ISO date
    }

    Responses:
    - 201: {"id": 1, "title": "My Visa Checklist", "overall_deadline": "2025-12-31", ...}
    - 400: {"error": "No input data provided"}
    - 422: {"field": ["validation error message"]}
    """
    user_id = get_jwt_identity()
    json_data = request.get_json()
    if not json_data:
        return jsonify({"error": "No input data provided"}), 400
    try:
        data = checklist_schema.load(json_data)
    except ValidationError as err:
        return jsonify(err.messages), 422

    new_checklist = Checklist(user_id=user_id, title=data['title'], overall_deadline=data.get('overall_deadline'))
    db.session.add(new_checklist)
    db.session.commit()
    return jsonify(checklist_schema.dump(new_checklist)), 201

@checklists_bp.route('/', methods=['GET'])
@jwt_required()
def get_checklists():
    """
    List all checklists owned by the authenticated user.

    Response 200: [{"id": 1, "title": "...", "overall_deadline": null, ...}, ...]
    """
    user_id = get_jwt_identity()
    checklists = Checklist.query.filter_by(user_id=user_id).all()
    return jsonify(checklists_schema.dump(checklists))

@checklists_bp.route('/<int:checklist_id>', methods=['GET'])
@jwt_required()
def get_checklist(checklist_id):
    """
    Get a single checklist by id.

    Path params:
      checklist_id: integer

    Responses:
    - 200: Checklist object
    - 404: {"error": "Checklist not found or unauthorized"}
    """
    user_id = get_jwt_identity()
    include = (request.args.get('include') or '').lower()

    if 'files' in include:
        # Eager-load categories -> items -> uploaded_files to prevent DB N+1
        checklist = (
            db.session.query(Checklist)
            .options(
                subqueryload(Checklist.categories)
                .subqueryload(Category.items)
                .subqueryload(Item.uploaded_files)
            )
            .filter(Checklist.id == checklist_id, Checklist.user_id == user_id)
            .first()
        )
    else:
        checklist = authorize_user_for_checklist(checklist_id, user_id)

    if not checklist:
        return jsonify({"error": "Checklist not found or unauthorized"}), 404

    return jsonify(checklist_schema.dump(checklist))

@checklists_bp.route('/<int:checklist_id>', methods=['PATCH'])
@jwt_required()
def update_checklist(checklist_id):
    """
    Update fields of a checklist.

    Request (application/json): any subset of
    {"title": "New Title", "overall_deadline": "2025-12-31"}

    Responses:
    - 200: Updated checklist
    - 404: {"error": "Checklist not found or unauthorized"}
    - 422: Validation errors
    """
    user_id = get_jwt_identity()
    checklist = authorize_user_for_checklist(checklist_id, user_id)
    if not checklist:
        return jsonify({"error": "Checklist not found or unauthorized"}), 404

    json_data = request.get_json()
    try:
        data = checklist_schema.load(json_data, partial=True)
    except ValidationError as err:
        return jsonify(err.messages), 422

    checklist.title = data.get('title', checklist.title)
    checklist.overall_deadline = data.get('overall_deadline', checklist.overall_deadline)
    db.session.commit()
    return jsonify(checklist_schema.dump(checklist))

@checklists_bp.route('/<int:checklist_id>', methods=['DELETE'])
@jwt_required()
def delete_checklist(checklist_id):
    """
    Delete a checklist by id.

    Responses:
    - 200: {"message": "Checklist deleted successfully"}
    - 404: {"error": "Checklist not found or unauthorized"}
    """
    user_id = get_jwt_identity()
    checklist = authorize_user_for_checklist(checklist_id, user_id)
    if not checklist:
        return jsonify({"error": "Checklist not found or unauthorized"}), 404
    db.session.delete(checklist)
    db.session.commit()
    return jsonify({"message": "Checklist deleted successfully"}), 200

# Category routes
@checklists_bp.route('/<int:checklist_id>/categories', methods=['POST'])
@jwt_required()
def create_category(checklist_id):
    """
    Create a category under a checklist.

    Request: {"title": "Documents"}
    Responses: 201 category, 404 if checklist not found/unauthorized, 422 validation errors
    """
    user_id = get_jwt_identity()
    if not authorize_user_for_checklist(checklist_id, user_id):
        return jsonify({"error": "Checklist not found or unauthorized"}), 404

    json_data = request.get_json()
    try:
        data = category_schema.load(json_data)
    except ValidationError as err:
        return jsonify(err.messages), 422

    new_category = Category(checklist_id=checklist_id, title=data['title'])
    db.session.add(new_category)
    db.session.commit()
    return jsonify(category_schema.dump(new_category)), 201

@checklists_bp.route('/<int:checklist_id>/categories', methods=['GET'])
@jwt_required()
def get_categories(checklist_id):
    """
    List categories for a checklist.
    """
    user_id = get_jwt_identity()
    checklist = authorize_user_for_checklist(checklist_id, user_id)
    if not checklist:
        return jsonify({"error": "Checklist not found or unauthorized"}), 404
    return jsonify(categories_schema.dump(checklist.categories))

@checklists_bp.route('/categories/<int:category_id>', methods=['PATCH'])
@jwt_required()
def update_category(category_id):
    """
    Update a category.

    Request: {"title": "New Title"}
    """
    user_id = get_jwt_identity()
    category = db.session.get(Category, category_id)
    if not category or not authorize_user_for_checklist(category.checklist_id, user_id):
        return jsonify({"error": "Category not found or unauthorized"}), 404

    json_data = request.get_json()
    try:
        data = category_schema.load(json_data, partial=True)
    except ValidationError as err:
        return jsonify(err.messages), 422
    
    category.title = data.get('title', category.title)
    db.session.commit()
    return jsonify(category_schema.dump(category))

@checklists_bp.route('/categories/<int:category_id>', methods=['DELETE'])
@jwt_required()
def delete_category(category_id):
    """
    Delete a category by id.

    Responses:
    - 200: {"message": "Category deleted successfully"}
    - 404: {"error": "Category not found or unauthorized"}
    """
    user_id = get_jwt_identity()
    category = db.session.get(Category, category_id)
    if not category or not authorize_user_for_checklist(category.checklist_id, user_id):
        return jsonify({"error": "Category not found or unauthorized"}), 404

    db.session.delete(category)
    db.session.commit()
    return jsonify({"message": "Category deleted successfully"}), 200

# Item routes
@checklists_bp.route('/categories/<int:category_id>/items', methods=['POST'])
@jwt_required()
def create_item(category_id):
    """
    Create an item under a category.

    Request: conforms to ItemSchema
    Response 201: item
    """
    user_id = get_jwt_identity()
    category = db.session.get(Category, category_id)
    if not category or not authorize_user_for_checklist(category.checklist_id, user_id):
        return jsonify({"error": "Category not found or unauthorized"}), 404

    json_data = request.get_json()
    try:
        data = item_schema.load(json_data)
    except ValidationError as err:
        return jsonify(err.messages), 422

    new_item = Item(category_id=category_id, **data)
    db.session.add(new_item)
    db.session.commit()
    # Marshmallow v3 does not accept 'exclude' in dump(); instantiate schema with exclude instead
    return jsonify(ItemSchema(exclude=('uploaded_files',)).dump(new_item)), 201

@checklists_bp.route('/items/<int:item_id>', methods=['PATCH'])
@jwt_required()
def update_item(item_id):
    """
    Update an item by id.
    Request: partial ItemSchema fields
    """
    user_id = get_jwt_identity()
    item = db.session.get(Item, item_id)
    if not item or not authorize_user_for_checklist(item.category.checklist_id, user_id):
        return jsonify({"error": "Item not found or unauthorized"}), 404
    
    json_data = request.get_json()
    try:
        data = item_schema.load(json_data, partial=True)
    except ValidationError as err:
        return jsonify(err.messages), 422
    
    for key, value in data.items():
        setattr(item, key, value)
        
    db.session.commit()
    return jsonify(item_schema.dump(item))

@checklists_bp.route('/items/<int:item_id>', methods=['DELETE'])
@jwt_required()
def delete_item(item_id):
    """
    Delete an item by id.
    """
    user_id = get_jwt_identity()
    item = db.session.get(Item, item_id)
    if not item or not authorize_user_for_checklist(item.category.checklist_id, user_id):
        return jsonify({"error": "Item not found or unauthorized"}), 404

    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Item deleted successfully"}), 200

# File upload routes for checklist items
@checklists_bp.route('/items/<int:item_id>/files', methods=['POST'])
@jwt_required()
@validate_file_upload('checklist')
@log_file_operation('checklist_file_upload')
def upload_item_file(item_id):
    """
    Upload a file to a specific checklist item.
    
    Expected form data:
    - file: The file to upload
    - description: Optional description
    - tags: Optional tags
    
    Responses:
    - 201: {"message": "File uploaded successfully to checklist item", "file": FileSchema, "item_id": X}
    - 404: {"error": "Item not found or unauthorized"}
    - 413: {"error": "<quota exceeded>"}
    - 500: {"error": "Error uploading file"}
    """
    try:
        user_id = get_jwt_identity()
        
        # Verify item exists and user has access
        item = db.session.get(Item, item_id)
        if not item or not authorize_user_for_checklist(item.category.checklist_id, user_id):
            return jsonify({"error": "Item not found or unauthorized"}), 404
        
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
        upload_dir = get_upload_path(user_id, 'checklist', item_id)
        file_path = os.path.join(upload_dir, secure_name)
        
        # Ensure directory exists
        ensure_upload_directory(file_path)
        
        # Save file
        file.save(file_path)
        
        # Verify file was saved correctly
        if not os.path.exists(file_path) or get_file_size(file_path) != file_size:
            return jsonify({'error': 'Failed to save file'}), 500
        
        # Create database record bound to this item
        uploaded_file = UploadedFile(
            file_path=file_path,
            original_filename=file.filename,
            file_size=file_size,
            mime_type=mime_type,
            item_id=item_id,
            uploaded_at=func.now()
        )
        
        db.session.add(uploaded_file)
        db.session.commit()
        
        # Return file info with item context
        file_schema = FileSchema()
        return jsonify({
            'message': 'File uploaded successfully to checklist item',
            'file': file_schema.dump(uploaded_file),
            'item_id': item_id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error uploading file to item {item_id}: {str(e)}")
        return jsonify({'error': 'Error uploading file'}), 500

@checklists_bp.route('/items/<int:item_id>/files', methods=['GET'])
@jwt_required()
def get_item_files(item_id):
    """
    Get all files for a specific checklist item.
    
    Responses:
    - 200: {"files": [FileSchema...], "item_id": X}
    - 404: {"error": "Item not found or unauthorized"}
    """
    try:
        user_id = get_jwt_identity()
        
        # Verify item exists and user has access
        item = db.session.get(Item, item_id)
        if not item or not authorize_user_for_checklist(item.category.checklist_id, user_id):
            return jsonify({"error": "Item not found or unauthorized"}), 404
        
        # Get files for this item
        files = UploadedFile.query.filter_by(item_id=item_id).all()
        
        file_schema = FileSchema()
        return jsonify({
            'files': [file_schema.dump(file) for file in files],
            'item_id': item_id
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting files for item {item_id}: {str(e)}")
        return jsonify({'error': 'Error getting files'}), 500


@checklists_bp.route('/items/<int:item_id>/files/<int:file_id>', methods=['DELETE'])
@jwt_required()
def delete_item_file(item_id, file_id):
    """
    Delete a specific file attached to an item.

    Responses:
    - 200: {"message": "File deleted"}
    - 404: {"error": "Item or file not found or unauthorized"}
    """
    user_id = get_jwt_identity()
    item = db.session.get(Item, item_id)
    if not item or not authorize_user_for_checklist(item.category.checklist_id, user_id):
        return jsonify({"error": "Item not found or unauthorized"}), 404

    uploaded_file = UploadedFile.query.filter_by(id=file_id, item_id=item_id).first()
    if not uploaded_file:
        return jsonify({"error": "File not found"}), 404

    # Try filesystem delete, but proceed with DB deletion even if file is missing
    try:
        fs_delete_file(uploaded_file.file_path)
    except Exception as e:
        logger.warning(f"Failed to delete file from disk for file_id={file_id}: {str(e)}")

    db.session.delete(uploaded_file)
    db.session.commit()
    return jsonify({"message": "File deleted"}), 200


@checklists_bp.route('/items/<int:item_id>/files/<int:file_id>', methods=['PATCH'])
@jwt_required()
def rename_item_file(item_id, file_id):
    """
    Rename a specific file attached to an item.

    Request JSON: { "original_filename": "new-name.ext" }
    """
    user_id = get_jwt_identity()
    item = db.session.get(Item, item_id)
    if not item or not authorize_user_for_checklist(item.category.checklist_id, user_id):
        return jsonify({"error": "Item not found or unauthorized"}), 404

    uploaded_file = UploadedFile.query.filter_by(id=file_id, item_id=item_id).first()
    if not uploaded_file:
        return jsonify({"error": "File not found"}), 404

    data = request.get_json(silent=True) or {}
    new_name = (data.get('original_filename') or '').strip()
    if not new_name:
        return jsonify({"error": "original_filename is required"}), 422

    # Compute new secure filename in same item directory
    old_name, old_ext = os.path.splitext(os.path.basename(uploaded_file.file_path))
    base_secure = secure_filename(new_name)
    if not base_secure:
        return jsonify({"error": "Invalid filename"}), 422
    new_base, new_ext = os.path.splitext(base_secure)
    if not new_ext:
        new_ext = old_ext
    final_name = f"{new_base}{new_ext}"
    upload_dir = get_upload_path(user_id, 'checklist', item_id)
    new_path = os.path.join(upload_dir, final_name)

    # Prevent overwrite
    if os.path.exists(new_path):
        return jsonify({"error": "A file with the requested name already exists"}), 409

    # Attempt filesystem rename
    if not os.path.exists(uploaded_file.file_path):
        logger.error(f"Source file missing for file_id={file_id}: {uploaded_file.file_path}")
        return jsonify({"error": "Source file missing"}), 404
    if not fs_rename_file(uploaded_file.file_path, new_path):
        logger.error(f"Filesystem rename failed for file_id={file_id} -> {new_path}")
        return jsonify({"error": "Failed to rename file"}), 500

    # Update DB
    uploaded_file.file_path = new_path
    uploaded_file.original_filename = final_name
    db.session.commit()

    file_schema = FileSchema()
    return jsonify({
        'message': 'File renamed',
        'file': file_schema.dump(uploaded_file),
        'item_id': item_id
    }), 200
