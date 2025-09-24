"""SSE streaming endpoint for real-time AI responses."""
from flask import Response, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.core.stream_manager import StreamManager
import redis
import json
import time
import os


def get_redis_client():
    """Get Redis client instance."""
    redis_url = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
    return redis.from_url(redis_url, decode_responses=True)


def get_stream_manager():
    """Get StreamManager instance."""
    redis_client = get_redis_client()
    return StreamManager(redis_client)


# Initialize Redis and StreamManager
redis_client = get_redis_client()
stream_manager = get_stream_manager()


def create_sse_response(stream_id: str):
    """Create SSE response for streaming AI responses."""
    user_id = get_jwt_identity()
    
    # Verify stream exists and user has access
    stream_data = stream_manager.get_stream(stream_id)
    if not stream_data or stream_data['user_id'] != user_id:
        return Response("Stream not found", status=404)
    
    def event_stream():
        events_key = stream_manager.get_events_key(stream_id)
        last_id = stream_manager.get_last_id(stream_id) or '0-0'
        
        try:
            # Send initial connection confirmation
            yield f"data: {json.dumps({'type': 'connected', 'stream_id': stream_id})}\n\n"
            
            # Listen for messages with timeout via XREAD
            start_time = time.time()
            timeout = 300  # 5 minutes
            
            while True:
                # Check timeout
                if time.time() - start_time > timeout:
                    yield f"data: {json.dumps({'type': 'timeout', 'message': 'Stream timeout'})}\n\n"
                    break
                # Block up to 5s waiting for new entries
                results = redis_client.xread({events_key: last_id}, count=100, block=5000)
                if not results:
                    continue
                for key, entries in results:
                    for entry_id, fields in entries:
                        # Expect a 'payload' field containing JSON
                        payload = fields.get('payload') if isinstance(fields, dict) else None
                        if not payload:
                            continue
                        try:
                            data = json.loads(payload)
                        except Exception:
                            continue
                        
                        # Update last_id and stream activity
                        last_id = entry_id.decode() if isinstance(entry_id, bytes) else str(entry_id)
                        try:
                            stream_manager.set_last_id(stream_id, last_id)
                        except Exception:
                            pass
                        stream_manager.update_stream_activity(stream_id)
                        
                        # Forward message to client
                        yield f"data: {json.dumps(data)}\n\n"
                        
                        # Check if stream is complete
                        if data.get('type') in ['complete', 'error']:
                            stream_manager.mark_stream_complete(stream_id)
                            break
                    else:
                        continue
                    break
                        
        except Exception as e:
            # Log error and send error message
            yield f"data: {json.dumps({'type': 'error', 'message': f'Stream error: {str(e)}'})}\n\n"
            
        finally:
            # CRITICAL: Always cleanup
            try:
                # Mark stream as disconnected if still active
                stream_data = stream_manager.get_stream(stream_id)
                if stream_data and stream_data['status'] == 'active':
                    stream_data['status'] = 'disconnected'
                    stream_data['disconnected_at'] = time.time()
                    redis_client.hset(
                        stream_manager.streams_key, 
                        stream_id, 
                        json.dumps(stream_data)
                    )
            except Exception:
                pass
    return Response(event_stream(), content_type='text/event-stream', headers={
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
    })


def stream_ai_response(stream_id: str):
    """SSE endpoint backed by Redis Streams for streaming AI responses."""
    return create_sse_response(stream_id)
