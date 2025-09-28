"""AI service for processing chat messages with streaming responses."""
from google import genai
from google.genai import types  # noqa: F401  # reserved for future tool configs
import redis
import json
from app.core.extensions import db
from app.db.models import Message, Conversation
from app.core.stream_manager import StreamManager
from app.core import ai_tools
from app.core.title_generator import generate_title


class AIService:
    """Service for handling AI interactions with streaming responses."""
    
    def __init__(self, redis_client: redis.Redis, stream_manager: StreamManager):
        self.redis = redis_client
        self.stream_manager = stream_manager
        self.client = None
        # Allow overriding the model via environment variable AI_MODEL
        self.model_name = 'gemini-2.0-flash-001'
        
        # Initialize Gemini client if API key is available
        import os
        env_model = os.environ.get('AI_MODEL')
        if env_model:
            self.model_name = env_model
        api_key = os.environ.get('GEMINI_API_KEY')
        if api_key:
            # The python-genai client reads API key from env automatically
            # but we keep explicit construction for clarity.
            self.client = genai.Client(api_key=api_key)
    
    def process_ai_task(self, message_id: int, stream_id: str) -> None:
        """Process AI task with Redis state management and retry logic."""
        ai_message = None
        conversation_id = None

        try:
            # Get message and conversation data
            user_message = Message.query.get(message_id)
            if not user_message:
                self._create_error_message(None, stream_id, f"Message {message_id} not found")
                return
                
            conversation = Conversation.query.get(user_message.conversation_id)
            if not conversation:
                self._create_error_message(user_message.conversation_id, stream_id, f"Conversation {user_message.conversation_id} not found")
                return
            
            conversation_id = conversation.id
            
            # Verify stream still exists
            stream_data = self.stream_manager.get_stream(stream_id)
            if not stream_data:
                self._create_error_message(conversation_id, stream_id, f"Stream {stream_id} not found")
                return
            
            # Create AI message in database with streaming status
            ai_message = Message(
                conversation_id=conversation.id,
                content="",
                role='assistant',
                status='streaming',
                parent_message_id=user_message.id
            )
            db.session.add(ai_message)
            db.session.commit()
            
            # Stream AI response using Redis Streams
            self._stream_ai_response_with_redis(
                user_message, 
                ai_message, 
                stream_id, 
                conversation.id
            )
            
        except Exception as exc:
            # Create error message if not already created
            if not ai_message and conversation_id:
                self._create_error_message(conversation_id, stream_id, str(exc))
            elif ai_message:
                self._handle_ai_error(ai_message, stream_id, f"stream:{stream_id}", str(exc))
            # Mark stream as error
            self.stream_manager.mark_stream_error(stream_id, str(exc))

    def process_guest_messages_stream(self, messages: list[dict], stream_id: str) -> None:
        """Stream AI response for guest users without persisting to the database."""

        events_key = self.stream_manager.get_events_key(stream_id)
        ai_response = ""

        try:
            if not messages:
                raise ValueError("No messages provided")

            if not self.client:
                raise RuntimeError("AI service is temporarily unavailable. Please try again later.")

            from google.genai import types

            gemini_messages = []
            for msg in messages:
                if not isinstance(msg, dict):
                    continue
                role = msg.get('role')
                content = msg.get('content')
                if not content:
                    continue
                if role == 'user':
                    gemini_messages.append(types.Content(
                        role='user',
                        parts=[types.Part.from_text(text=str(content))]
                    ))
                else:
                    gemini_messages.append(types.Content(
                        role='model',
                        parts=[types.Part.from_text(text=str(content))]
                    ))

            if not gemini_messages:
                raise ValueError("No valid messages provided")

            response = self.client.models.generate_content_stream(
                model=self.model_name,
                contents=gemini_messages,
            )

            for chunk in response:
                if not self.stream_manager.get_stream(stream_id):
                    break

                if getattr(chunk, 'text', None):
                    content = chunk.text
                    ai_response += content
                    payload = json.dumps({'type': 'chunk', 'content': content, 'message_id': None})
                    _ = self.redis.xadd(events_key, {'payload': payload})
                    self.stream_manager.update_stream_activity(stream_id)

            complete_payload = json.dumps({'type': 'complete', 'message_id': None})
            _ = self.redis.xadd(events_key, {'payload': complete_payload})
            self.stream_manager.mark_stream_complete(stream_id)
            self.stream_manager.trim_events_stream(stream_id)

        except Exception as exc:
            self._emit_guest_error(stream_id, str(exc))
    
    def _create_error_message(self, conversation_id: int, stream_id: str, error_msg: str) -> None:
        """Create an error message when AI processing fails early."""
        if not conversation_id:
            return
            
        try:
            ai_message = Message(
                conversation_id=conversation_id,
                content=f"Error: {error_msg}",
                role='assistant',
                status='error'
            )
            db.session.add(ai_message)
            db.session.commit()
            
            # Write error event to Redis Stream so SSE can consume it
            try:
                events_key = self.stream_manager.get_events_key(stream_id)
                payload = json.dumps({'type': 'error','message': error_msg,'message_id': ai_message.id})
                _ = self.redis.xadd(events_key, {'payload': payload})
            except Exception:
                pass
            
        except Exception:
            pass
    def _stream_ai_response_with_redis(self, user_message: Message, ai_message: Message, 
                                     stream_id: str, conversation_id: int) -> None:
        """Stream AI response using Redis Streams (XADD)."""
        events_key = self.stream_manager.get_events_key(stream_id)
        ai_response = ""
        
        try:
            # Get conversation history
            messages = Message.query.filter_by(
                conversation_id=conversation_id
            ).order_by(Message.timestamp).all()
            
            # Convert to AI format
            ai_messages = [
                {"role": msg.role, "content": msg.content} 
                for msg in messages
            ]
            
            # Check if Gemini client is available
            if not self.client:
                error_msg = "AI service is temporarily unavailable. Please try again later."
                self._handle_ai_error(ai_message, stream_id, f"stream:{stream_id}", error_msg)
                return
            
            # Convert messages to Gemini format using types.Content
            from google.genai import types
            gemini_messages = []
            for msg in ai_messages:
                if msg['role'] == 'user':
                    gemini_messages.append(types.Content(
                        role='user', 
                        parts=[types.Part.from_text(text=msg['content'])]
                    ))
                elif msg['role'] == 'assistant':
                    gemini_messages.append(types.Content(
                        role='model', 
                        parts=[types.Part.from_text(text=msg['content'])]
                    ))
            
            # With Redis Streams, late consumers can replay from 0-0 or last_id.

            # Call Gemini API with streaming
            response = self.client.models.generate_content_stream(
                model=self.model_name,
                contents=gemini_messages,
            )
            
            for chunk in response:
                # Check if stream still exists
                if not self.stream_manager.get_stream(stream_id):
                    break
                    
                if getattr(chunk, 'text', None):
                    content = chunk.text
                    ai_response += content
                    
                    # Add chunk event to Redis Stream
                    payload = json.dumps({'type': 'chunk','content': content,'message_id': ai_message.id})
                    _ = self.redis.xadd(events_key, {'payload': payload})
                    
                    # Update stream activity
                    self.stream_manager.update_stream_activity(stream_id)
            
            # Update database with complete response
            ai_message.content = ai_response
            ai_message.status = 'complete'
            db.session.commit()
            
            # Add completion event
            complete_payload = json.dumps({'type': 'complete','message_id': ai_message.id})
            _ = self.redis.xadd(events_key, {'payload': complete_payload})
            
            # Mark stream as complete
            self.stream_manager.mark_stream_complete(stream_id)
            # Optionally trim stream size
            self.stream_manager.trim_events_stream(stream_id)
            
        except Exception as e:
            self._handle_ai_error(ai_message, stream_id, f"stream:{stream_id}", str(e))

    def generate_title_via_tool(self, first_message_text: str) -> str:
        """Try to generate a title using GenAI tool-calling; fallback locally.

        Keeps logic minimal: declare the title tool and ask the model to call it
        based on the first user message. If the client isn't configured or
        function call isn't returned, use local fallbacks.
        """
        try:
            if not self.client:
                return generate_title(ai_tool_title=None, first_message=first_message_text)

            tools_spec = ai_tools.get_tools_spec()
            # Prompt model to call the tool to produce a concise title from the first message
            contents = [
                {"role": "user", "parts": [
                    (
                        "Given the following first user message, call the tool "
                        "generate_conversation_title with the best concise title. "
                        "Return a function call, not plain text.\n\n"
                    ),
                    first_message_text,
                ]}
            ]

            resp = self.client.models.generate_content(
                model=self.model_name,
                contents=contents,
                config={
                    "tools": [tools_spec],
                    # Ensure it may produce a function call
                    "tool_config": {"function_calling_config": {"mode": "ANY"}},
                },
            )

            fcalls = getattr(resp, "function_calls", None)
            if not fcalls:
                return generate_title(ai_tool_title=None, first_message=first_message_text)

            # Use the first function call result; guard for structure differences
            call = fcalls[0]
            args = getattr(call, "args", None)
            if args and "title" in args:
                return generate_title(ai_tool_title=str(args["title"]), first_message=first_message_text)

            # Some SDK surfaces args as dict(call.args)
            try:
                args_dict = dict(args) if args is not None else {}
            except Exception:
                args_dict = {}
            if "title" in args_dict:
                return generate_title(ai_tool_title=str(args_dict["title"]), first_message=first_message_text)

            return generate_title(ai_tool_title=None, first_message=first_message_text)

        except Exception:
            # Fall back silently to local generation on any SDK/runtime error
            return generate_title(ai_tool_title=None, first_message=first_message_text)
    
    def _handle_ai_error(self, ai_message: Message, stream_id: str, channel: str, error_msg: str) -> None:
        """Handle AI processing errors."""
        # Update database with error
        ai_message.status = 'error'
        ai_message.content = f"Error: {error_msg}"
        db.session.commit()

        # Add error event to Redis Stream
        try:
            events_key = self.stream_manager.get_events_key(stream_id)
            payload = json.dumps({'type': 'error','message': error_msg,'message_id': ai_message.id})
            _ = self.redis.xadd(events_key, {'payload': payload})
        except Exception:
            pass

        # Mark stream as error
        self.stream_manager.mark_stream_error(stream_id, error_msg)

    def _emit_guest_error(self, stream_id: str, error_msg: str) -> None:
        """Emit an error event for guest streams."""
        try:
            events_key = self.stream_manager.get_events_key(stream_id)
            payload = json.dumps({'type': 'error', 'message': error_msg, 'message_id': None})
            _ = self.redis.xadd(events_key, {'payload': payload})
        except Exception:
            pass

        self.stream_manager.mark_stream_error(stream_id, error_msg)
