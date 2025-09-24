"""Chat API routes for message handling."""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.core.extensions import db
from app.db.models import Message, Conversation, User
from app.services.ai_service import AIService
from app.tasks.ai import process_message_stream_task
from app.core.stream_manager import StreamManager
from app.api.chat.sse import stream_ai_response
from app.core.title_generator import generate_title

import redis
import uuid
import os


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
@jwt_required()
def send_message():
    """Smart send: supports existing and new conversations.

    - Existing conversation: requires conversation_id, behaves as before.
    - New conversation: if conversation_id missing, auto-create with AI-generated title (Phase 5 will wire full tool-calling).
    """
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data or not data.get('content'):
        return jsonify({'error': 'Content required'}), 400

    conversation_id = data.get('conversation_id')

    try:
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

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


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
                'created_at': conversation.created_at.isoformat()
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
        ).order_by(Conversation.updated_at.desc()).all()
        
        return jsonify({
            'conversations': [{
                'id': conv.id,
                'title': conv.title,
                'created_at': conv.created_at.isoformat(),
                'updated_at': conv.updated_at.isoformat(),
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


@chat_bp.route('/stream/<stream_id>', methods=['GET'])
@jwt_required()
def stream_ai_response_route(stream_id):
    """SSE endpoint for streaming AI responses."""
    return stream_ai_response(stream_id)
