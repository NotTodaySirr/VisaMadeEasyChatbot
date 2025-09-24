from app.core.extensions import db
from sqlalchemy import func
from datetime import datetime


class Conversation(db.Model):
    """Conversation model for chat sessions."""
    __tablename__ = 'conversation'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, server_default=func.now())
    updated_at = db.Column(db.DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = db.relationship('User', backref=db.backref('conversations', lazy=True))
    messages = db.relationship('Message', backref='conversation', lazy=True, cascade="all, delete-orphan")
    
    def __repr__(self):
        return f'<Conversation {self.id}: {self.title}>'

    @staticmethod
    def normalize_title(raw_title: str) -> str:
        """Clamp and normalize titles to fit DB and UI constraints.

        - Trim outer whitespace
        - Collapse inner whitespace
        - Clamp to 255 chars (DB column limit)
        """
        if not raw_title:
            return raw_title
        t = raw_title.strip()
        # Collapse whitespace sequences
        import re
        t = re.sub(r"\s+", " ", t)
        return t[:255]


class Message(db.Model):
    """Message model for chat messages."""
    __tablename__ = 'message'
    
    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey('conversation.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'user' or 'assistant'
    status = db.Column(db.String(20), nullable=False, default='complete')  # 'streaming', 'complete', 'error'
    timestamp = db.Column(db.DateTime, server_default=func.now())
    parent_message_id = db.Column(db.Integer, db.ForeignKey('message.id'), nullable=True)
    
    # Self-referential relationship for message threading
    parent_message = db.relationship('Message', remote_side=[id], backref='replies')
    
    def __repr__(self):
        return f'<Message {self.id}: {self.role}>'
    
    def to_dict(self):
        """Convert message to dictionary for JSON serialization."""
        return {
            'id': self.id,
            'conversation_id': self.conversation_id,
            'content': self.content,
            'role': self.role,
            'status': self.status,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'parent_message_id': self.parent_message_id
        }
