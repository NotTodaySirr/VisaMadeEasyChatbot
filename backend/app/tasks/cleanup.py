"""Background cleanup tasks for chat streams and other artifacts."""
import os

import redis
from celery import Celery

from app import create_app
from app.core.celery import celery
from app.core.stream_manager import StreamManager
from app.services.password_reset_service import prune_expired_reset_tokens


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
    except Exception as exc:
        print(f"Cleanup task error: {exc}")
        return 0


# Celery task definition
def create_cleanup_task(celery_app: Celery):
    """Create the cleanup task for Celery."""

    @celery_app.task
    def cleanup_expired_streams_task():
        """Celery task to clean up expired streams."""
        return cleanup_expired_streams()

    return cleanup_expired_streams_task


def cleanup_password_reset_tokens():
    """Remove password reset tokens that are past the configured retention window."""
    try:
        app = create_app(os.environ.get('FLASK_CONFIG', 'development'))
        with app.app_context():
            from flask import current_app

            retention = current_app.config.get('PASSWORD_RESET_TOKEN_RETENTION_MINUTES', 1440)
            deleted = prune_expired_reset_tokens(retention)
            print(f"Cleaned up {deleted} expired password reset tokens")
            return deleted
    except Exception as exc:
        print(f"Password reset token cleanup error: {exc}")
        return 0


@celery.task(name='cleanup.password_reset_tokens')
def cleanup_password_reset_tokens_task():
    """Celery task wrapper for password reset token cleanup."""
    return cleanup_password_reset_tokens()
