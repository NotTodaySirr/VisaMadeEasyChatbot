"""Redis-based stream management for SSE connections."""
import redis
import json
import time
from typing import Dict, Optional


class StreamManager:
    """Manages SSE streams using Redis for state persistence."""
    
    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client
        self.streams_key = "active_streams"
        self.health_key_prefix = "stream_health:"
        self.events_key_prefix = "stream_events:"
        self.default_stream_ttl_seconds = 600  # 10 minutes to allow short replays
    
    def create_stream(self, stream_id: str, user_id: int, conversation_id: int) -> bool:
        """Create a new stream and set initial state."""
        stream_data = {
            'stream_id': stream_id,
            'user_id': user_id,
            'conversation_id': conversation_id,
            'status': 'active',
            'created_at': time.time(),
            'last_activity': time.time(),
            # Redis Streams last delivered id for SSE resumption. "0-0" means from start
            'last_id': '0-0'
        }
        
        # Store in Redis Hash
        self.redis.hset(self.streams_key, stream_id, json.dumps(stream_data))
        
        # Set health check with TTL
        self.redis.setex(f"{self.health_key_prefix}{stream_id}", 60, "alive")
        
        return True

    def get_events_key(self, stream_id: str) -> str:
        return f"{self.events_key_prefix}{stream_id}"

    def get_last_id(self, stream_id: str) -> str:
        stream_data = self.get_stream(stream_id)
        return stream_data.get('last_id', '0-0') if stream_data else '0-0'

    def set_last_id(self, stream_id: str, last_id: str) -> None:
        stream_data = self.get_stream(stream_id) or {}
        stream_data['last_id'] = last_id
        self.redis.hset(self.streams_key, stream_id, json.dumps(stream_data))
    
    def update_stream_activity(self, stream_id: str) -> bool:
        """Refresh stream activity and extend TTL."""
        if not self.redis.exists(f"{self.health_key_prefix}{stream_id}"):
            return False  # Stream doesn't exist or expired
        
        # Refresh TTL
        self.redis.setex(f"{self.health_key_prefix}{stream_id}", 60, "alive")
        
        # Update last activity
        stream_data = self.get_stream(stream_id)
        if stream_data:
            stream_data['last_activity'] = time.time()
            self.redis.hset(self.streams_key, stream_id, json.dumps(stream_data))
        
        return True
    
    def get_stream(self, stream_id: str) -> Optional[Dict]:
        """Get stream data from Redis."""
        data = self.redis.hget(self.streams_key, stream_id)
        return json.loads(data) if data else None
    
    def mark_stream_complete(self, stream_id: str) -> bool:
        """Mark stream as completed."""
        stream_data = self.get_stream(stream_id)
        if stream_data:
            stream_data['status'] = 'complete'
            stream_data['completed_at'] = time.time()
            self.redis.hset(self.streams_key, stream_id, json.dumps(stream_data))
            
            # Remove health check
            self.redis.delete(f"{self.health_key_prefix}{stream_id}")
            # Set TTL for events stream so it can be replayed briefly, then cleaned
            try:
                self.redis.expire(self.get_events_key(stream_id), self.default_stream_ttl_seconds)
            except Exception:
                pass
            return True
        return False
    
    def mark_stream_error(self, stream_id: str, error_message: str) -> bool:
        """Mark stream as errored."""
        stream_data = self.get_stream(stream_id)
        if stream_data:
            stream_data['status'] = 'error'
            stream_data['error_message'] = error_message
            stream_data['error_at'] = time.time()
            self.redis.hset(self.streams_key, stream_id, json.dumps(stream_data))
            
            # Remove health check
            self.redis.delete(f"{self.health_key_prefix}{stream_id}")
            try:
                self.redis.expire(self.get_events_key(stream_id), self.default_stream_ttl_seconds)
            except Exception:
                pass
            return True
        return False
    
    def cleanup_expired_streams(self) -> int:
        """Clean up streams whose health keys have expired."""
        expired_count = 0
        pattern = f"{self.health_key_prefix}*"
        
        for key in self.redis.scan_iter(match=pattern):
            if not self.redis.exists(key):
                # Health key expired, clean up stream
                # Handle both string and bytes keys
                key_str = key.decode() if isinstance(key, bytes) else key
                stream_id = key_str.replace(self.health_key_prefix, "")
                self.redis.hdel(self.streams_key, stream_id)
                expired_count += 1
        
        return expired_count
    
    def get_active_streams(self) -> Dict[str, Dict]:
        """Get all active streams."""
        streams = {}
        for stream_id, data in self.redis.hgetall(self.streams_key).items():
            streams[stream_id] = json.loads(data)
        return streams

    # Optional helpers for trimming stream size
    def trim_events_stream(self, stream_id: str, max_len_approx: int = 1000) -> None:
        try:
            self.redis.xtrim(self.get_events_key(stream_id), max_len_approx, approximate=True)
        except Exception:
            pass
