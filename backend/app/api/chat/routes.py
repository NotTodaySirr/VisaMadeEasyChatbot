"""Chat API routes for message handling."""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.core.extensions import db
from app.db.models import Message, Conversation
from app.services.ai_service import AIService
from app.tasks.ai import process_message_stream_task
from app.core.stream_manager import StreamManager
from app.api.chat.sse import stream_ai_response
from app.core.title_generator import generate_title
from sqlalchemy import func
from app.middleware.auth import optional_auth

import redis
import uuid
import os
import threading
import copy


def get_redis_client():
    """Get Redis client instance."""
    redis_url = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
    return redis.from_url(redis_url, decode_responses=True)


def get_ai_service():
    """Get AI service instance."""
    redis_client = get_redis_client()
    stream_manager = StreamManager(redis_client)
    return AIService(redis_client, stream_manager)


# Initialize Redis and services
redis_client = get_redis_client()
stream_manager = StreamManager(redis_client)
ai_service = get_ai_service()

chat_bp = Blueprint('chat', __name__, url_prefix='/chat')


@chat_bp.route('/send', methods=['POST'])
@optional_auth
def send_message(current_user):
    """Smart send: supports existing and new conversations.

    - Existing conversation: requires conversation_id, behaves as before.
    - New conversation: if conversation_id missing, auto-create with AI-generated title (Phase 5 will wire full tool-calling).
    """
    user_id = current_user.id if current_user else None
    data = request.get_json() or {}

    is_guest = user_id is None

    if is_guest:
        messages = data.get('messages')
        if not isinstance(messages, list) or not messages:
            return jsonify({'error': 'messages list required for guest chat'}), 400
        last_message = messages[-1]
        if not isinstance(last_message, dict) or last_message.get('role') != 'user' or not last_message.get('content'):
            return jsonify({'error': 'last message must be a user message with content'}), 400
    else:
        if not data.get('content'):
            return jsonify({'error': 'Content required'}), 400

    conversation_id = data.get('conversation_id') if not is_guest else None

    try:
        if not is_guest:
            # Existing conversation path
            if conversation_id:
                conversation = Conversation.query.filter_by(id=conversation_id, user_id=user_id).first()
                if not conversation:
                    return jsonify({'error': 'Conversation not found'}), 404

            # New conversation path
            if not conversation_id:
                # Prefer AI service tool-calling for title; it falls back locally.
                initial_title = ai_service.generate_title_via_tool(data['content'])
                conversation = Conversation(user_id=user_id, title=Conversation.normalize_title(initial_title))
                db.session.add(conversation)
                db.session.commit()
                conversation_id = conversation.id

            # Save user message
            user_message = Message(
                conversation_id=conversation_id,
                content=data['content'],
                role='user'
            )
            db.session.add(user_message)
            db.session.commit()

            # Generate unique stream ID for AI response
            stream_id = str(uuid.uuid4())

            # Create stream in Redis
            stream_manager.create_stream(stream_id, user_id, conversation_id)

            # Enqueue AI processing asynchronously
            try:
                process_message_stream_task.delay(user_message.id, stream_id)
            except Exception:
                # Fallback to inline processing if Celery not available
                ai_service.process_ai_task(user_message.id, stream_id)

            payload = {
                'status': 'processing_started',
                'message_id': user_message.id,
                'stream_id': stream_id
            }
            if data.get('conversation_id') is None:
                payload.update({'conversation_id': conversation_id, 'title': conversation.title})

            return jsonify(payload)
        else:
            stream_id = str(uuid.uuid4())
            stream_manager.create_stream(stream_id, None, None)

            def run_guest_stream(payload, sid):
                try:
                    ai_service.process_guest_messages_stream(payload, sid)
                except Exception:
                    pass

            messages_copy = copy.deepcopy(messages)
            threading.Thread(target=run_guest_stream, args=(messages_copy, stream_id), daemon=True).start()

            return jsonify({
                'status': 'processing_started',
                'message_id': None,
                'stream_id': stream_id
            })

    except Exception as e:
        db.session.rollback()

        # Check for specific service unavailability issues
        error_msg = str(e).lower()
        if any(service in error_msg for service in ['redis', 'connection refused', 'timeout']):
            return jsonify({'error': 'Service temporarily unavailable. Please try again.', 'status': 'UNAVAILABLE'}), 503
        elif 'api key' in error_msg or 'gemini' in error_msg:
            return jsonify({'error': 'AI service configuration issue. Please contact support.', 'status': 'UNAVAILABLE'}), 503
        else:
            return jsonify({'error': 'Internal server error', 'status': 'INTERNAL_ERROR'}), 500


@chat_bp.route('/history/<int:conversation_id>', methods=['GET'])
@jwt_required()
def get_conversation_history(conversation_id):
    """Get conversation history."""
    user_id = get_jwt_identity()
    
    try:
        # Verify user owns this conversation
        conversation = Conversation.query.filter_by(
            id=conversation_id, 
            user_id=user_id
        ).first()
        
        if not conversation:
            return jsonify({'error': 'Conversation not found'}), 404
        
        messages = Message.query.filter_by(
            conversation_id=conversation_id
        ).order_by(Message.timestamp).all()
        
        return jsonify({
            'conversation': {
                'id': conversation.id,
                'title': conversation.title,
                'created_at': conversation.created_at.isoformat(),
                'updated_at': conversation.updated_at.isoformat() if conversation.updated_at else None,
                'pinned': getattr(conversation, 'pinned', False),
                'pinned_at': conversation.pinned_at.isoformat() if getattr(conversation, 'pinned_at', None) else None
            },
            'messages': [msg.to_dict() for msg in messages]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@chat_bp.route('/conversations', methods=['GET'])
@jwt_required()
def get_user_conversations():
    """Get all conversations for the current user."""
    user_id = get_jwt_identity()
    
    try:
        conversations = Conversation.query.filter_by(
            user_id=user_id
        ).order_by(
            Conversation.pinned.desc(),
            Conversation.pinned_at.desc(),
            Conversation.updated_at.desc()
        ).all()
        
        return jsonify({
            'conversations': [{
                'id': conv.id,
                'title': conv.title,
                'created_at': conv.created_at.isoformat(),
                'updated_at': conv.updated_at.isoformat(),
                'pinned': getattr(conv, 'pinned', False),
                'pinned_at': conv.pinned_at.isoformat() if getattr(conv, 'pinned_at', None) else None,
                'message_count': len(conv.messages)
            } for conv in conversations]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@chat_bp.route('/conversations', methods=['POST'])
@jwt_required()
def create_conversation():
    """Create a new conversation."""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('title'):
        return jsonify({'error': 'Title required'}), 400
    
    try:
        conversation = Conversation(
            user_id=user_id,
            title=data['title']
        )
        db.session.add(conversation)
        db.session.commit()
        
        return jsonify({
            'id': conversation.id,
            'title': conversation.title,
            'created_at': conversation.created_at.isoformat()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@chat_bp.route('/conversations/<int:conversation_id>/rename', methods=['PATCH'])
@jwt_required()
def rename_conversation(conversation_id):
    """Rename a conversation title (owner-only)."""
    user_id = get_jwt_identity()
    data = request.get_json() or {}

    new_title = data.get('title')
    if not new_title or not isinstance(new_title, str):
        return jsonify({'error': 'Title required'}), 400

    try:
        conversation = Conversation.query.filter_by(id=conversation_id, user_id=user_id).first()
        if not conversation:
            return jsonify({'error': 'Conversation not found'}), 404

        conversation.title = Conversation.normalize_title(new_title)
        db.session.commit()

        return jsonify({
            'id': conversation.id,
            'title': conversation.title
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@chat_bp.route('/conversations/<int:conversation_id>/pin', methods=['PATCH'])
@jwt_required()
def pin_conversation(conversation_id):
    """Pin or unpin a conversation. Body: { "pinned": true|false }"""
    user_id = get_jwt_identity()
    data = request.get_json() or {}

    if 'pinned' not in data:
        return jsonify({'error': 'pinned required'}), 400

    try:
        conversation = Conversation.query.filter_by(id=conversation_id, user_id=user_id).first()
        if not conversation:
            return jsonify({'error': 'Conversation not found'}), 404

        is_pinned = bool(data['pinned'])
        conversation.pinned = is_pinned
        conversation.pinned_at = func.now() if is_pinned else None
        db.session.commit()

        return jsonify({
            'id': conversation.id,
            'pinned': conversation.pinned,
            'pinned_at': conversation.pinned_at.isoformat() if conversation.pinned_at else None
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@chat_bp.route('/conversations/<int:conversation_id>', methods=['DELETE'])
@jwt_required()
def delete_conversation(conversation_id):
    """Delete a conversation and all of its messages (cascade)."""
    user_id = get_jwt_identity()

    try:
        conversation = Conversation.query.filter_by(id=conversation_id, user_id=user_id).first()
        if not conversation:
            return jsonify({'error': 'Conversation not found'}), 404

        db.session.delete(conversation)
        db.session.commit()

        return jsonify({'message': 'Conversation deleted', 'id': conversation_id})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@chat_bp.route('/health', methods=['GET'])
def chat_health_check():
    """Health check endpoint to verify chat service dependencies."""
    health_status = {
        'status': 'healthy',
        'services': {}
    }

    try:
        # Check Redis connection
        redis_client.ping()
        health_status['services']['redis'] = 'healthy'
    except Exception as e:
        health_status['status'] = 'unhealthy'
        health_status['services']['redis'] = f'error: {str(e)}'

    try:
        # Check database connection
        db.session.execute(db.text('SELECT 1'))
        health_status['services']['database'] = 'healthy'
    except Exception as e:
        health_status['status'] = 'unhealthy'
        health_status['services']['database'] = f'error: {str(e)}'

    try:
        # Check AI service (Gemini API key)
        api_key = os.environ.get('GEMINI_API_KEY')
        if api_key and ai_service.client:
            health_status['services']['ai_service'] = 'healthy'
        else:
            health_status['services']['ai_service'] = 'warning: API key not configured'
    except Exception as e:
        health_status['services']['ai_service'] = f'error: {str(e)}'

    # Check Celery worker availability (if configured)
    try:
        from app.tasks.ai import celery
        if celery:
            health_status['services']['celery'] = 'configured'
        else:
            health_status['services']['celery'] = 'not_available'
    except Exception:
        health_status['services']['celery'] = 'not_available'

    status_code = 200 if health_status['status'] == 'healthy' else 503
    return jsonify(health_status), status_code


@chat_bp.route('/stream/<stream_id>', methods=['GET'])
@optional_auth
def stream_ai_response_route(current_user, stream_id):
    """SSE endpoint for streaming AI responses."""
    current_user_id = current_user.id if current_user else None
    return stream_ai_response(stream_id, current_user_id)
