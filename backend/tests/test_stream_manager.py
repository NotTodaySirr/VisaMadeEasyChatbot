"""Tests for StreamManager."""
import pytest
import json
import time
from unittest.mock import Mock, patch
from app.core.stream_manager import StreamManager


class TestStreamManager:
    """Test StreamManager functionality."""
    
    @pytest.fixture
    def mock_redis(self):
        """Create a mock Redis client."""
        mock_redis = Mock()
        mock_redis.hset = Mock()
        mock_redis.hget = Mock()
        mock_redis.hgetall = Mock()
        mock_redis.hdel = Mock()
        mock_redis.setex = Mock()
        mock_redis.exists = Mock()
        mock_redis.scan_iter = Mock()
        mock_redis.delete = Mock()
        return mock_redis
    
    @pytest.fixture
    def stream_manager(self, mock_redis):
        """Create StreamManager with mock Redis."""
        return StreamManager(mock_redis)
    
    def test_create_stream(self, stream_manager, mock_redis):
        """Test creating a new stream."""
        stream_id = "test-stream-123"
        user_id = 1
        conversation_id = 1
        
        result = stream_manager.create_stream(stream_id, user_id, conversation_id)
        
        assert result is True
        mock_redis.hset.assert_called_once()
        mock_redis.setex.assert_called_once()
        
        # Verify the stream data structure
        call_args = mock_redis.hset.call_args
        assert call_args[0][0] == "active_streams"
        assert call_args[0][1] == stream_id
        
        stream_data = json.loads(call_args[0][2])
        assert stream_data['stream_id'] == stream_id
        assert stream_data['user_id'] == user_id
        assert stream_data['conversation_id'] == conversation_id
        assert stream_data['status'] == 'active'
        assert 'created_at' in stream_data
        assert 'last_activity' in stream_data
    
    def test_get_stream(self, stream_manager, mock_redis):
        """Test getting stream data."""
        stream_id = "test-stream-123"
        stream_data = {
            'stream_id': stream_id,
            'user_id': 1,
            'conversation_id': 1,
            'status': 'active'
        }
        
        mock_redis.hget.return_value = json.dumps(stream_data)
        
        result = stream_manager.get_stream(stream_id)
        
        assert result == stream_data
        mock_redis.hget.assert_called_once_with("active_streams", stream_id)
    
    def test_get_stream_not_found(self, stream_manager, mock_redis):
        """Test getting non-existent stream."""
        stream_id = "non-existent-stream"
        mock_redis.hget.return_value = None
        
        result = stream_manager.get_stream(stream_id)
        
        assert result is None
    
    def test_update_stream_activity(self, stream_manager, mock_redis):
        """Test updating stream activity."""
        stream_id = "test-stream-123"
        stream_data = {
            'stream_id': stream_id,
            'user_id': 1,
            'conversation_id': 1,
            'status': 'active',
            'last_activity': time.time() - 10
        }
        
        mock_redis.exists.return_value = True
        mock_redis.hget.return_value = json.dumps(stream_data)
        
        result = stream_manager.update_stream_activity(stream_id)
        
        assert result is True
        mock_redis.setex.assert_called_once()
        mock_redis.hset.assert_called_once()
    
    def test_update_stream_activity_expired(self, stream_manager, mock_redis):
        """Test updating activity for expired stream."""
        stream_id = "expired-stream"
        mock_redis.exists.return_value = False
        
        result = stream_manager.update_stream_activity(stream_id)
        
        assert result is False
        mock_redis.setex.assert_not_called()
        mock_redis.hset.assert_not_called()
    
    def test_mark_stream_complete(self, stream_manager, mock_redis):
        """Test marking stream as complete."""
        stream_id = "test-stream-123"
        stream_data = {
            'stream_id': stream_id,
            'user_id': 1,
            'conversation_id': 1,
            'status': 'active'
        }
        
        mock_redis.hget.return_value = json.dumps(stream_data)
        
        result = stream_manager.mark_stream_complete(stream_id)
        
        assert result is True
        mock_redis.hset.assert_called_once()
        mock_redis.delete.assert_called_once()
        
        # Verify the updated stream data
        call_args = mock_redis.hset.call_args
        updated_data = json.loads(call_args[0][2])
        assert updated_data['status'] == 'complete'
        assert 'completed_at' in updated_data
    
    def test_mark_stream_error(self, stream_manager, mock_redis):
        """Test marking stream as error."""
        stream_id = "test-stream-123"
        error_message = "Test error"
        stream_data = {
            'stream_id': stream_id,
            'user_id': 1,
            'conversation_id': 1,
            'status': 'active'
        }
        
        mock_redis.hget.return_value = json.dumps(stream_data)
        
        result = stream_manager.mark_stream_error(stream_id, error_message)
        
        assert result is True
        mock_redis.hset.assert_called_once()
        mock_redis.delete.assert_called_once()
        
        # Verify the updated stream data
        call_args = mock_redis.hset.call_args
        updated_data = json.loads(call_args[0][2])
        assert updated_data['status'] == 'error'
        assert updated_data['error_message'] == error_message
        assert 'error_at' in updated_data
    
    def test_cleanup_expired_streams(self, stream_manager, mock_redis):
        """Test cleaning up expired streams."""
        # Mock scan_iter to return some health keys
        mock_redis.scan_iter.return_value = [
            "stream_health:stream1",
            "stream_health:stream2"
        ]
        
        # Mock exists to return False for all keys (expired)
        mock_redis.exists.return_value = False
        
        result = stream_manager.cleanup_expired_streams()
        
        assert result == 2
        assert mock_redis.hdel.call_count == 2
    
    def test_get_active_streams(self, stream_manager, mock_redis):
        """Test getting all active streams."""
        streams_data = {
            "stream1": json.dumps({
                'stream_id': 'stream1',
                'user_id': 1,
                'status': 'active'
            }),
            "stream2": json.dumps({
                'stream_id': 'stream2',
                'user_id': 2,
                'status': 'complete'
            })
        }
        
        mock_redis.hgetall.return_value = streams_data
        
        result = stream_manager.get_active_streams()
        
        assert len(result) == 2
        assert 'stream1' in result
        assert 'stream2' in result
        assert result['stream1']['status'] == 'active'
        assert result['stream2']['status'] == 'complete'
