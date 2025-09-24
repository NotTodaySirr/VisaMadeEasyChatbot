"""Tests for AI service."""
import pytest
import json
from unittest.mock import Mock, patch, MagicMock
from app.core.extensions import db
from app.db.models import User, Conversation, Message
from app.services.ai_service import AIService


class TestAIService:
    """Test AI service functionality."""
    
    @pytest.fixture
    def mock_redis(self):
        """Create a mock Redis client."""
        mock_redis = Mock()
        mock_redis.publish = Mock()
        return mock_redis
    
    @pytest.fixture
    def mock_stream_manager(self):
        """Create a mock StreamManager."""
        mock_sm = Mock()
        mock_sm.get_stream = Mock()
        mock_sm.update_stream_activity = Mock()
        mock_sm.mark_stream_complete = Mock()
        mock_sm.mark_stream_error = Mock()
        return mock_sm
    
    @pytest.fixture
    def ai_service(self, mock_redis, mock_stream_manager):
        """Create AIService with mocks."""
        return AIService(mock_redis, mock_stream_manager)
    
    def test_init_without_gemini_key(self, mock_redis, mock_stream_manager):
        """Test AIService initialization without Gemini API key."""
        with patch.dict('os.environ', {}, clear=True):
            service = AIService(mock_redis, mock_stream_manager)
            assert service.gemini_model is None
    
    def test_init_with_gemini_key(self, mock_redis, mock_stream_manager):
        """Test AIService initialization with Gemini API key."""
        with patch.dict('os.environ', {'GEMINI_API_KEY': 'test-key'}):
            with patch('google.generativeai.configure') as mock_configure:
                with patch('google.generativeai.GenerativeModel') as mock_model:
                    mock_model_instance = Mock()
                    mock_model.return_value = mock_model_instance
                    
                    service = AIService(mock_redis, mock_stream_manager)
                    assert service.gemini_model is not None
                    mock_configure.assert_called_once_with(api_key='test-key')
                    mock_model.assert_called_once_with('gemini-1.5-flash')
    
    def test_process_ai_task_message_not_found(self, ai_service, mock_stream_manager, app):
        """Test processing AI task when message not found."""
        mock_stream_manager.get_stream.return_value = {'status': 'active'}
        
        with app.app_context():
            with patch('app.db.models.Message.query') as mock_query:
                mock_query.get.return_value = None
                
                ai_service.process_ai_task(999, 'test-stream')
                
                # Should not raise exception, just return early
                mock_stream_manager.get_stream.assert_called_once_with('test-stream')
    
    def test_process_ai_task_conversation_not_found(self, ai_service, mock_stream_manager, app):
        """Test processing AI task when conversation not found."""
        mock_message = Mock()
        mock_message.conversation_id = 999
        mock_stream_manager.get_stream.return_value = {'status': 'active'}
        
        with app.app_context():
            with patch('app.db.models.Message.query') as mock_query:
                mock_query.get.return_value = mock_message
                mock_query.filter_by.return_value.first.return_value = None
                
                ai_service.process_ai_task(1, 'test-stream')
                
                # Should not raise exception, just return early
                mock_stream_manager.get_stream.assert_called_once_with('test-stream')
    
    def test_process_ai_task_stream_not_found(self, ai_service, mock_stream_manager, app):
        """Test processing AI task when stream not found."""
        mock_message = Mock()
        mock_message.conversation_id = 1
        mock_stream_manager.get_stream.return_value = None
        
        with app.app_context():
            with patch('app.db.models.Message.query') as mock_query:
                mock_query.get.return_value = mock_message
                
                ai_service.process_ai_task(1, 'test-stream')
                
                # Should not raise exception, just return early
                mock_stream_manager.get_stream.assert_called_once_with('test-stream')
    
    @patch('app.db.models.Message.query')
    @patch('app.db.models.Conversation.query')
    def test_process_ai_task_success(self, mock_conv_query, mock_msg_query, 
                                   ai_service, mock_stream_manager, mock_redis, app):
        """Test successful AI task processing."""
        # Setup mocks
        mock_message = Mock()
        mock_message.id = 1
        mock_message.conversation_id = 1
        mock_message.content = "Hello"
        mock_message.role = "user"
        
        mock_conversation = Mock()
        mock_conversation.id = 1
        
        mock_msg_query.get.return_value = mock_message
        mock_conv_query.filter_by.return_value.first.return_value = mock_conversation
        mock_stream_manager.get_stream.return_value = {'status': 'active'}
        
        with app.app_context():
            # Mock database session
            with patch('app.core.extensions.db') as mock_db:
                mock_db.session.add = Mock()
                mock_db.session.commit = Mock()
                
                # Mock the streaming method
                with patch.object(ai_service, '_stream_ai_response_with_redis') as mock_stream:
                    ai_service.process_ai_task(1, 'test-stream')
                    
                    # Verify database operations
                    mock_db.session.add.assert_called_once()
                    mock_db.session.commit.assert_called_once()
                    
                    # Verify streaming was called
                    mock_stream.assert_called_once()
    
    def test_handle_ai_error(self, ai_service, mock_redis, mock_stream_manager, app):
        """Test handling AI errors."""
        mock_message = Mock()
        mock_message.id = 123  # Add proper ID for JSON serialization
        stream_id = 'test-stream'
        channel = 'stream:test-stream'
        error_msg = 'Test error'
        
        with app.app_context():
            with patch('app.core.extensions.db') as mock_db:
                mock_db.session.commit = Mock()
                
                ai_service._handle_ai_error(mock_message, stream_id, channel, error_msg)
                
                # Verify message was updated
                assert mock_message.status == 'error'
                assert mock_message.content == f'Error: {error_msg}'
                
                # Verify database commit
                mock_db.session.commit.assert_called_once()
                
                # Verify Redis publish
                mock_redis.publish.assert_called_once()
                
                # Verify stream manager error marking
                mock_stream_manager.mark_stream_error.assert_called_once_with(stream_id, error_msg)
    
    @patch('google.generativeai.GenerativeModel')
    def test_stream_ai_response_success(self, mock_model_class, ai_service, mock_redis, mock_stream_manager, app):
        """Test successful AI response streaming."""
        # Setup mocks
        mock_user_message = Mock()
        mock_user_message.content = "Hello"
        mock_user_message.role = "user"
        
        mock_ai_message = Mock()
        mock_ai_message.id = 2
        mock_ai_message.content = ""
        mock_ai_message.role = "assistant"
        
        mock_stream_manager.get_stream.return_value = {'status': 'active'}
        
        # Mock Gemini response
        mock_chunk1 = Mock()
        mock_chunk1.text = "Hello"
        
        mock_chunk2 = Mock()
        mock_chunk2.text = " there!"
        
        mock_model_instance = Mock()
        mock_model_instance.generate_content.return_value = [mock_chunk1, mock_chunk2]
        mock_model_class.return_value = mock_model_instance
        
        # Set the gemini_model on the service
        ai_service.gemini_model = mock_model_instance
        
        with app.app_context():
            # Mock database operations
            with patch('app.core.extensions.db') as mock_db:
                mock_db.session.commit = Mock()
                
                with patch('app.db.models.Message.query') as mock_query:
                    mock_query.filter_by.return_value.order_by.return_value.all.return_value = [mock_user_message]
                    
                    ai_service._stream_ai_response_with_redis(
                        mock_user_message, mock_ai_message, 'test-stream', 1
                    )
                    
                    # Verify Gemini was called
                    mock_model_instance.generate_content.assert_called_once()
                    
                    # Verify Redis publish calls
                    assert mock_redis.publish.call_count >= 2
                    
                    # Verify stream activity updates
                    assert mock_stream_manager.update_stream_activity.call_count >= 2
                    
                    # Verify final message update
                    assert mock_ai_message.content == "Hello there!"
                    assert mock_ai_message.status == 'complete'
                    
                    # Verify completion publish
                    publish_calls = mock_redis.publish.call_args_list
                    completion_call = publish_calls[-1]
                    completion_data = json.loads(completion_call[0][1])
                    assert completion_data['type'] == 'complete'
    
    def test_stream_ai_response_no_gemini_model(self, ai_service, mock_redis, mock_stream_manager, app):
        """Test streaming when Gemini model is not available."""
        mock_user_message = Mock()
        mock_ai_message = Mock()
        mock_ai_message.id = 123  # Add proper ID for JSON serialization
        
        ai_service.gemini_model = None
        
        with app.app_context():
            with patch('app.core.extensions.db') as mock_db:
                mock_db.session.commit = Mock()
                
                ai_service._stream_ai_response_with_redis(
                    mock_user_message, mock_ai_message, 'test-stream', 1
                )
                
                # Verify error handling
                assert mock_ai_message.status == 'error'
                assert 'Gemini API key not configured' in mock_ai_message.content
                
                # Verify error publish
                mock_redis.publish.assert_called_once()
                publish_data = json.loads(mock_redis.publish.call_args[0][1])
                assert publish_data['type'] == 'error'
                
                # Verify stream error marking
                mock_stream_manager.mark_stream_error.assert_called_once()
    
    def test_stream_ai_response_stream_disappears(self, ai_service, mock_redis, mock_stream_manager, app):
        """Test streaming when stream disappears during processing."""
        mock_user_message = Mock()
        mock_ai_message = Mock()
        mock_ai_message.id = 123  # Add proper ID for JSON serialization
        
        # First call returns stream, second call returns None (stream disappeared)
        mock_stream_manager.get_stream.side_effect = [{'status': 'active'}, None]
        
        with app.app_context():
            with patch('google.generativeai.GenerativeModel') as mock_model_class:
                mock_chunk = Mock()
                mock_chunk.text = "Hello"
                
                mock_model_instance = Mock()
                mock_model_instance.generate_content.return_value = [mock_chunk]
                mock_model_class.return_value = mock_model_instance
                
                # Set the gemini_model on the service
                ai_service.gemini_model = mock_model_instance
                
                ai_service._stream_ai_response_with_redis(
                    mock_user_message, mock_ai_message, 'test-stream', 1
                )
                
                # Should stop processing when stream disappears
                mock_model_instance.generate_content.assert_called_once()
                # Only one publish call (for the first chunk)
                assert mock_redis.publish.call_count == 1
