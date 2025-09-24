"""Celery task to run AI processing asynchronously."""
import os
import redis
import json
from app.core.celery import celery
from app.core.stream_manager import StreamManager
from app.services.ai_service import AIService
from app import create_app


def _get_redis_client() -> redis.Redis:
    # Use Docker network URL when running in container, localhost when running locally
    redis_url = os.environ.get('REDIS_URL', 'redis://redis:6379/0')
    return redis.from_url(redis_url, decode_responses=True)


@celery.task(name='ai.process_message_stream')
def process_message_stream_task(message_id: int, stream_id: str) -> None:
    """Background task to process AI message and stream via Redis Streams."""
    # Ensure Flask application context for DB access
    app = create_app(os.environ.get('FLASK_CONFIG', 'development'))
    with app.app_context():
        try:
            redis_client = _get_redis_client()
            stream_manager = StreamManager(redis_client)
            ai_service = AIService(redis_client, stream_manager)
            ai_service.process_ai_task(message_id, stream_id)
        except Exception as e:
            # Log error and try to write error event to stream
            print(f"AI task error: {e}")
            try:
                redis_client = _get_redis_client()
                events_key = f"stream_events:{stream_id}"
                error_payload = json.dumps({'type': 'error', 'message': str(e), 'message_id': None})
                redis_client.xadd(events_key, {'payload': error_payload})
            except Exception:
                pass


