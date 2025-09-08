from app.core.extensions import db
from sqlalchemy.sql import func
import datetime

class Checklist(db.Model):
    __tablename__ = 'checklist'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    overall_deadline = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, server_default=func.now())

    user = db.relationship('User', backref=db.backref('checklists', lazy=True))
    categories = db.relationship('Category', backref='checklist', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Checklist {self.title}>'

class Category(db.Model):
    __tablename__ = 'category'

    id = db.Column(db.Integer, primary_key=True)
    checklist_id = db.Column(db.Integer, db.ForeignKey('checklist.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)

    items = db.relationship('Item', backref='category', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Category {self.title}>'

class Item(db.Model):
    __tablename__ = 'item'

    id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    deadline = db.Column(db.Date, nullable=True)
    is_completed = db.Column(db.Boolean, default=False, nullable=False)

    uploaded_files = db.relationship('UploadedFile', backref='item', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Item {self.title}>'

class UploadedFile(db.Model):
    __tablename__ = 'uploaded_file'

    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey('item.id'), nullable=False)
    file_path = db.Column(db.String(1024), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    uploaded_at = db.Column(db.DateTime, server_default=func.now())

    def __repr__(self):
        return f'<UploadedFile {self.original_filename}>'
