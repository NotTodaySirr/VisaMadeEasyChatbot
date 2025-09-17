from app.core.extensions import db
from sqlalchemy.sql import func
import datetime

class UploadedFile(db.Model):
    """General file upload model for storing file metadata."""
    __tablename__ = 'uploaded_file'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    file_path = db.Column(db.String(1024), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    file_size = db.Column(db.Integer, nullable=False)
    mime_type = db.Column(db.String(100), nullable=False)
    uploaded_at = db.Column(db.DateTime, server_default=func.now())
    description = db.Column(db.Text, nullable=True)
    tags = db.Column(db.String(200), nullable=True)
    content_type = db.Column(db.String(50), nullable=False, default='checklist')
    
    # Optional foreign key for checklist items (nullable for general files)
    item_id = db.Column(db.Integer, db.ForeignKey('item.id'), nullable=True)
    
    # Relationships
    user = db.relationship('User', backref=db.backref('uploaded_files', lazy=True))
    item = db.relationship('Item', backref=db.backref('uploaded_files', lazy=True))

    def __repr__(self):
        return f'<UploadedFile {self.original_filename}>'
    
    def to_dict(self):
        """Convert model to dictionary for JSON serialization."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'file_path': self.file_path,
            'original_filename': self.original_filename,
            'file_size': self.file_size,
            'mime_type': self.mime_type,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None,
            'description': self.description,
            'tags': self.tags,
            'content_type': self.content_type,
            'item_id': self.item_id
        }
