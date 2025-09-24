"""Tests for chat models."""
import pytest
from datetime import datetime
from app.core.extensions import db
from app.db.models import Conversation, Message, User


class TestConversationModel:
    """Test Conversation model."""
    
    def test_create_conversation(self, app):
        """Test creating a conversation."""
        with app.app_context():
            user = User(
                email='test@example.com',
                username='testuser',
                yearofbirth=1990,
                educational_level='Bachelor\'s Degree'
            )
            user.set_password('password')
            db.session.add(user)
            db.session.commit()
            
            conversation = Conversation(
                user_id=user.id,
                title='Test Conversation'
            )
            db.session.add(conversation)
            db.session.commit()
            
            assert conversation.id is not None
            assert conversation.title == 'Test Conversation'
            assert conversation.user_id == user.id
            assert conversation.created_at is not None
            assert conversation.updated_at is not None
    
    def test_conversation_relationship(self, app):
        """Test conversation relationships."""
        with app.app_context():
            user = User(
                email='test@example.com',
                username='testuser',
                yearofbirth=1990,
                educational_level='Bachelor\'s Degree'
            )
            user.set_password('password')
            db.session.add(user)
            db.session.commit()
            
            conversation = Conversation(
                user_id=user.id,
                title='Test Conversation'
            )
            db.session.add(conversation)
            db.session.commit()
            
            # Test user relationship
            assert conversation.user == user
            assert conversation in user.conversations
    
    def test_conversation_repr(self, app):
        """Test conversation string representation."""
        with app.app_context():
            user = User(
                email='test@example.com',
                username='testuser',
                yearofbirth=1990,
                educational_level='Bachelor\'s Degree'
            )
            user.set_password('password')
            db.session.add(user)
            db.session.commit()
            
            conversation = Conversation(
                user_id=user.id,
                title='Test Conversation'
            )
            db.session.add(conversation)
            db.session.commit()
            
            repr_str = repr(conversation)
            assert 'Conversation' in repr_str
            assert str(conversation.id) in repr_str
            assert 'Test Conversation' in repr_str


class TestMessageModel:
    """Test Message model."""
    
    def test_create_message(self, app):
        """Test creating a message."""
        with app.app_context():
            user = User(
                email='test@example.com',
                username='testuser',
                yearofbirth=1990,
                educational_level='Bachelor\'s Degree'
            )
            user.set_password('password')
            db.session.add(user)
            db.session.commit()
            
            conversation = Conversation(
                user_id=user.id,
                title='Test Conversation'
            )
            db.session.add(conversation)
            db.session.commit()
            
            message = Message(
                conversation_id=conversation.id,
                content='Hello, world!',
                role='user'
            )
            db.session.add(message)
            db.session.commit()
            
            assert message.id is not None
            assert message.content == 'Hello, world!'
            assert message.role == 'user'
            assert message.status == 'complete'  # default status
            assert message.conversation_id == conversation.id
            assert message.timestamp is not None
    
    def test_message_relationships(self, app):
        """Test message relationships."""
        with app.app_context():
            user = User(
                email='test@example.com',
                username='testuser',
                yearofbirth=1990,
                educational_level='Bachelor\'s Degree'
            )
            user.set_password('password')
            db.session.add(user)
            db.session.commit()
            
            conversation = Conversation(
                user_id=user.id,
                title='Test Conversation'
            )
            db.session.add(conversation)
            db.session.commit()
            
            user_message = Message(
                conversation_id=conversation.id,
                content='Hello!',
                role='user'
            )
            db.session.add(user_message)
            db.session.commit()
            
            ai_message = Message(
                conversation_id=conversation.id,
                content='Hi there!',
                role='assistant',
                parent_message_id=user_message.id
            )
            db.session.add(ai_message)
            db.session.commit()
            
            # Test conversation relationship
            assert user_message.conversation == conversation
            assert ai_message.conversation == conversation
            
            # Test parent-child relationship
            assert ai_message.parent_message == user_message
            assert ai_message in user_message.replies
    
    def test_message_to_dict(self, app):
        """Test message to_dict method."""
        with app.app_context():
            user = User(
                email='test@example.com',
                username='testuser',
                yearofbirth=1990,
                educational_level='Bachelor\'s Degree'
            )
            user.set_password('password')
            db.session.add(user)
            db.session.commit()
            
            conversation = Conversation(
                user_id=user.id,
                title='Test Conversation'
            )
            db.session.add(conversation)
            db.session.commit()
            
            message = Message(
                conversation_id=conversation.id,
                content='Test message',
                role='user',
                status='complete'
            )
            db.session.add(message)
            db.session.commit()
            
            message_dict = message.to_dict()
            
            assert message_dict['id'] == message.id
            assert message_dict['conversation_id'] == conversation.id
            assert message_dict['content'] == 'Test message'
            assert message_dict['role'] == 'user'
            assert message_dict['status'] == 'complete'
            assert 'timestamp' in message_dict
    
    def test_message_repr(self, app):
        """Test message string representation."""
        with app.app_context():
            user = User(
                email='test@example.com',
                username='testuser',
                yearofbirth=1990,
                educational_level='Bachelor\'s Degree'
            )
            user.set_password('password')
            db.session.add(user)
            db.session.commit()
            
            conversation = Conversation(
                user_id=user.id,
                title='Test Conversation'
            )
            db.session.add(conversation)
            db.session.commit()
            
            message = Message(
                conversation_id=conversation.id,
                content='Test message',
                role='user'
            )
            db.session.add(message)
            db.session.commit()
            
            repr_str = repr(message)
            assert 'Message' in repr_str
            assert str(message.id) in repr_str
            assert 'user' in repr_str
