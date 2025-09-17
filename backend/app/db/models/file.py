from app.core.extensions import db
from sqlalchemy.sql import func
import datetime

class UploadedFile(db.Model):
    """General file upload model for storing file metadata."""
    __tablename__ = 'uploaded_file'

    id = db.Column(db.Integer, primary_key=True)
    file_path = db.Column(db.String(1024), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    uploaded_at = db.Column(db.DateTime, server_default=func.now())

    # Foreign key for checklist items
    item_id = db.Column(db.Integer, db.ForeignKey('item.id'), nullable=False)
    
    # Relationships
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
