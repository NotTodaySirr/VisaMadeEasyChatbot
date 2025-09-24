"""Tests for chat API routes."""
import pytest
import json
from unittest.mock import patch, Mock
from app.core.extensions import db
from app.db.models import User, Conversation, Message


class TestChatAPI:
    """Test chat API endpoints."""
    
    def test_send_message_success(self, client, auth_headers, test_user):
        """Test sending a message successfully."""
        with client.application.app_context():
            # Create a conversation
            conversation = Conversation(
                user_id=test_user.id,
                title='Test Conversation'
            )
            db.session.add(conversation)
            db.session.commit()
            
            # Mock the AI service
            with patch('app.api.chat.routes.ai_service') as mock_ai_service:
                mock_ai_service.process_ai_task = Mock()
                
                response = client.post('/chat/send', 
                    json={
                        'content': 'Hello, AI!',
                        'conversation_id': conversation.id
                    },
                    headers=auth_headers
                )
                
                assert response.status_code == 200
                data = response.get_json()
                assert data['status'] == 'processing_started'
                assert 'message_id' in data
                assert 'stream_id' in data
                
                # Verify message was saved
                message = Message.query.filter_by(conversation_id=conversation.id).first()
                assert message is not None
                assert message.content == 'Hello, AI!'
                assert message.role == 'user'
    
    def test_send_message_missing_data(self, client, auth_headers):
        """Test sending message with missing data."""
        response = client.post('/chat/send', 
            json={},
            headers=auth_headers
        )
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
        assert 'required' in data['error']
    
    def test_send_message_invalid_conversation(self, client, auth_headers):
        """Test sending message to non-existent conversation."""
        response = client.post('/chat/send', 
            json={
                'content': 'Hello!',
                'conversation_id': 999
            },
            headers=auth_headers
        )
        
        assert response.status_code == 404
        data = response.get_json()
        assert 'error' in data
        assert 'not found' in data['error']
    
    def test_send_message_unauthorized_conversation(self, client, auth_headers):
        """Test sending message to conversation owned by another user."""
        with client.application.app_context():
            # Create another user and conversation
            other_user = User(
                email='other@example.com',
                username='otheruser',
                yearofbirth=1990,
                educational_level='Bachelor\'s Degree'
            )
            other_user.set_password('password')
            db.session.add(other_user)
            db.session.commit()
            
            conversation = Conversation(
                user_id=other_user.id,
                title='Other User Conversation'
            )
            db.session.add(conversation)
            db.session.commit()
            
            response = client.post('/chat/send', 
                json={
                    'content': 'Hello!',
                    'conversation_id': conversation.id
                },
                headers=auth_headers
            )
            
            assert response.status_code == 404
            data = response.get_json()
            assert 'error' in data
            assert 'not found' in data['error']
    
    def test_get_conversation_history(self, client, auth_headers, test_user):
        """Test getting conversation history."""
        with client.application.app_context():
            # Create conversation with messages
            conversation = Conversation(
                user_id=test_user.id,
                title='Test Conversation'
            )
            db.session.add(conversation)
            db.session.commit()
            
            # Add messages
            user_message = Message(
                conversation_id=conversation.id,
                content='Hello!',
                role='user'
            )
            ai_message = Message(
                conversation_id=conversation.id,
                content='Hi there!',
                role='assistant'
            )
            db.session.add_all([user_message, ai_message])
            db.session.commit()
            
            response = client.get(f'/chat/history/{conversation.id}', 
                headers=auth_headers
            )
            
            assert response.status_code == 200
            data = response.get_json()
            assert 'conversation' in data
            assert 'messages' in data
            assert len(data['messages']) == 2
            assert data['conversation']['id'] == conversation.id
            assert data['conversation']['title'] == 'Test Conversation'
    
    def test_get_conversation_history_not_found(self, client, auth_headers):
        """Test getting history for non-existent conversation."""
        response = client.get('/chat/history/999', headers=auth_headers)
        
        assert response.status_code == 404
        data = response.get_json()
        assert 'error' in data
        assert 'not found' in data['error']
    
    def test_get_user_conversations(self, client, auth_headers, test_user):
        """Test getting all user conversations."""
        with client.application.app_context():
            # Create multiple conversations
            conv1 = Conversation(
                user_id=test_user.id,
                title='Conversation 1'
            )
            conv2 = Conversation(
                user_id=test_user.id,
                title='Conversation 2'
            )
            db.session.add_all([conv1, conv2])
            db.session.commit()
            
            response = client.get('/chat/conversations', headers=auth_headers)
            
            assert response.status_code == 200
            data = response.get_json()
            assert 'conversations' in data
            assert len(data['conversations']) == 2
            
            # Check conversation data structure
            conv_data = data['conversations'][0]
            assert 'id' in conv_data
            assert 'title' in conv_data
            assert 'created_at' in conv_data
            assert 'updated_at' in conv_data
            assert 'message_count' in conv_data
    
    def test_create_conversation(self, client, auth_headers, test_user):
        """Test creating a new conversation."""
        response = client.post('/chat/conversations', 
            json={'title': 'New Conversation'},
            headers=auth_headers
        )
        
        assert response.status_code == 201
        data = response.get_json()
        assert 'id' in data
        assert data['title'] == 'New Conversation'
        assert 'created_at' in data
        
        # Verify conversation was saved
        with client.application.app_context():
            conversation = Conversation.query.filter_by(title='New Conversation').first()
            assert conversation is not None
            assert conversation.user_id == test_user.id
    
    def test_create_conversation_missing_title(self, client, auth_headers):
        """Test creating conversation without title."""
        response = client.post('/chat/conversations', 
            json={},
            headers=auth_headers
        )
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
        assert 'Title required' in data['error']
    
    def test_stream_endpoint_requires_auth(self, client):
        """Test that stream endpoint requires authentication."""
        response = client.get('/chat/stream/test-stream-id')
        
        assert response.status_code == 401
    
    @patch('app.api.chat.sse.stream_manager')
    def test_stream_endpoint_stream_not_found(self, mock_stream_manager, client, auth_headers):
        """Test stream endpoint when stream not found."""
        mock_stream_manager.get_stream.return_value = None
        
        response = client.get('/chat/stream/non-existent-stream', 
            headers=auth_headers
        )
        
        assert response.status_code == 404
    
    @patch('app.api.chat.sse.stream_manager')
    def test_stream_endpoint_unauthorized_user(self, mock_stream_manager, client, auth_headers):
        """Test stream endpoint when user doesn't own the stream."""
        mock_stream_manager.get_stream.return_value = {
            'user_id': 999,  # Different user
            'status': 'active'
        }
        
        response = client.get('/chat/stream/test-stream', 
            headers=auth_headers
        )
        
        assert response.status_code == 404
