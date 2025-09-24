"""Background cleanup tasks for chat streams."""
from celery import Celery
from app.core.stream_manager import StreamManager
import redis
import os


def get_redis_client():
    """Get Redis client instance."""
    redis_url = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
    return redis.from_url(redis_url, decode_responses=True)


def get_stream_manager():
    """Get StreamManager instance."""
    redis_client = get_redis_client()
    return StreamManager(redis_client)


def cleanup_expired_streams():
    """Periodic task to clean up expired streams."""
    try:
        stream_manager = get_stream_manager()
        expired_count = stream_manager.cleanup_expired_streams()
        print(f"Cleaned up {expired_count} expired streams")
        return expired_count
    except Exception as e:
        print(f"Cleanup task error: {e}")
        return 0


# Celery task definition
def create_cleanup_task(celery_app: Celery):
    """Create the cleanup task for Celery."""
    
    @celery_app.task
    def cleanup_expired_streams_task():
        """Celery task to clean up expired streams."""
        return cleanup_expired_streams()
    
    return cleanup_expired_streams_task
