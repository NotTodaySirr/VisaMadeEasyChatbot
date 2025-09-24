"""Tests for cleanup tasks."""
import pytest
from unittest.mock import Mock, patch
from app.tasks.cleanup import cleanup_expired_streams, get_redis_client, get_stream_manager


class TestCleanupTasks:
    """Test cleanup task functionality."""
    
    def test_get_redis_client(self):
        """Test getting Redis client."""
        with patch.dict('os.environ', {'REDIS_URL': 'redis://test:6379/0'}):
            with patch('redis.from_url') as mock_from_url:
                mock_client = Mock()
                mock_from_url.return_value = mock_client
                
                client = get_redis_client()
                
                assert client == mock_client
                mock_from_url.assert_called_once_with('redis://test:6379/0', decode_responses=True)
    
    def test_get_redis_client_default(self):
        """Test getting Redis client with default URL."""
        with patch.dict('os.environ', {}, clear=True):
            with patch('redis.from_url') as mock_from_url:
                mock_client = Mock()
                mock_from_url.return_value = mock_client
                
                client = get_redis_client()
                
                assert client == mock_client
                mock_from_url.assert_called_once_with('redis://localhost:6379/0', decode_responses=True)
    
    def test_get_stream_manager(self):
        """Test getting StreamManager instance."""
        with patch('app.tasks.cleanup.get_redis_client') as mock_get_redis:
            with patch('app.core.stream_manager.StreamManager') as mock_sm_class:
                mock_redis = Mock()
                mock_sm = Mock()
                mock_get_redis.return_value = mock_redis
                mock_sm_class.return_value = mock_sm
                
                result = get_stream_manager()
                
                assert result == mock_sm
                mock_get_redis.assert_called_once()
                mock_sm_class.assert_called_once_with(mock_redis)
    
    def test_cleanup_expired_streams_success(self):
        """Test successful cleanup of expired streams."""
        with patch('app.tasks.cleanup.get_stream_manager') as mock_get_sm:
            mock_sm = Mock()
            mock_sm.cleanup_expired_streams.return_value = 5
            mock_get_sm.return_value = mock_sm
            
            result = cleanup_expired_streams()
            
            assert result == 5
            mock_sm.cleanup_expired_streams.assert_called_once()
    
    def test_cleanup_expired_streams_error(self):
        """Test cleanup with error handling."""
        with patch('app.tasks.cleanup.get_stream_manager') as mock_get_sm:
            mock_sm = Mock()
            mock_sm.cleanup_expired_streams.side_effect = Exception("Redis error")
            mock_get_sm.return_value = mock_sm
            
            result = cleanup_expired_streams()
            
            assert result == 0
    
    def test_create_cleanup_task(self):
        """Test creating Celery cleanup task."""
        from app.tasks.cleanup import create_cleanup_task
        
        mock_celery_app = Mock()
        
        with patch('app.tasks.cleanup.cleanup_expired_streams') as mock_cleanup:
            mock_cleanup.return_value = 3
            
            task_func = create_cleanup_task(mock_celery_app)
            
            # Verify task was created
            mock_celery_app.task.assert_called_once()
            
            # Test the task function
            result = task_func()
            assert result == 3
            mock_cleanup.assert_called_once()
