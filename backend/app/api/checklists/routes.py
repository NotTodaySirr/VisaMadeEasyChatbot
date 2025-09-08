from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.core.extensions import db
from app.db.models.checklist import Checklist, Category, Item
from app.schemas.checklist import ChecklistSchema, CategorySchema, ItemSchema
from marshmallow import ValidationError

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
    user_id = get_jwt_identity()
    checklists = Checklist.query.filter_by(user_id=user_id).all()
    return jsonify(checklists_schema.dump(checklists))

@checklists_bp.route('/<int:checklist_id>', methods=['GET'])
@jwt_required()
def get_checklist(checklist_id):
    user_id = get_jwt_identity()
    checklist = authorize_user_for_checklist(checklist_id, user_id)
    if not checklist:
        return jsonify({"error": "Checklist not found or unauthorized"}), 404
    return jsonify(checklist_schema.dump(checklist))

@checklists_bp.route('/<int:checklist_id>', methods=['PATCH'])
@jwt_required()
def update_checklist(checklist_id):
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
    user_id = get_jwt_identity()
    checklist = authorize_user_for_checklist(checklist_id, user_id)
    if not checklist:
        return jsonify({"error": "Checklist not found or unauthorized"}), 404
    return jsonify(categories_schema.dump(checklist.categories))

@checklists_bp.route('/categories/<int:category_id>', methods=['PATCH'])
@jwt_required()
def update_category(category_id):
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

# Item routes
@checklists_bp.route('/categories/<int:category_id>/items', methods=['POST'])
@jwt_required()
def create_item(category_id):
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
    return jsonify(item_schema.dump(new_item)), 201

@checklists_bp.route('/items/<int:item_id>', methods=['PATCH'])
@jwt_required()
def update_item(item_id):
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
    user_id = get_jwt_identity()
    item = db.session.get(Item, item_id)
    if not item or not authorize_user_for_checklist(item.category.checklist_id, user_id):
        return jsonify({"error": "Item not found or unauthorized"}), 404

    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Item deleted successfully"}), 200
