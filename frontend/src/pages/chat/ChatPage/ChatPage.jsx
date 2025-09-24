import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useChat } from '@ai-sdk/react';
import { chatService, streamingService as openStream } from '../../../services/chat/index.js';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChatWindow } from '../../../components/chat';
import { InputField } from '../../../components/common';
import './ChatPage.css';

const ChatPage = forwardRef(({ 
  initialMessage = '',
  className = "",
  layout = 'guest', // 'guest' | 'registered'
  scrollRef = null,
  conversationId = null,
}, ref) => {
  const { messages, append, isLoading, setMessages } = useChat({});
  const didInitRef = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Load history if conversationId provided
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!conversationId) return;
      try {
        const history = await chatService.getHistory(conversationId);
        if (!mounted) return;
        const normalized = (history || [])
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
          .map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            createdAt: m.timestamp,
          }));
        setMessages(normalized);
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, [conversationId]);

  // Handle initial message
  useEffect(() => {
    if (!didInitRef.current && initialMessage.trim()) {
      didInitRef.current = true;
      handleSendMessage(initialMessage);
      if (location && location.state && location.state.initialMessage) {
        navigate('.', { replace: true, state: {} });
      }
    }
  }, [initialMessage]);

  const handleSendMessage = async (message) => {
    if (!message.trim() || isLoading) return;
    await append({ role: 'user', content: message });

    try {
      const resp = await chatService.sendMessage({ content: message });
      const { stream_id: streamId, message_id: serverMessageId, conversation_id: convId, title } = resp || {};

      // Smart send: if new conversation created, reflect it
      if (convId && !conversationId) {
        navigate('/chat/in', { state: {} });
      }

      let assistantId = serverMessageId || `${Date.now()}-assistant`;
      let hasInserted = false;

      openStream(streamId, {
        onChunk: (data) => {
          const text = data?.content || data?.delta || '';
          setMessages((prev) => {
            const idx = prev.findIndex((m) => m.id === assistantId);
            if (idx === -1) {
              hasInserted = true;
              return [
                ...prev,
                { id: assistantId, role: 'assistant', content: text, createdAt: new Date().toISOString() },
              ];
            }
            const copy = [...prev];
            copy[idx] = { ...copy[idx], content: (copy[idx].content || '') + text };
            return copy;
          });
        },
        onComplete: () => {
          // nothing extra for now
        },
        onError: () => {
          if (!hasInserted) {
            setMessages((prev) => ([
              ...prev,
              { id: `${assistantId}-error`, role: 'assistant', content: 'Xin lỗi, luồng phản hồi bị gián đoạn.', createdAt: new Date().toISOString() },
            ]));
          }
        },
      });
    } catch (e) {
      setMessages((prev) => ([
        ...prev,
        { id: `${Date.now()}-assistant-error`, role: 'assistant', content: 'Xin lỗi, đã có lỗi xảy ra.', createdAt: new Date().toISOString() },
      ]));
    }
  };

  // Expose send method for external input (registered layout)
  useImperativeHandle(ref, () => ({
    sendMessage: (text) => handleSendMessage(text)
  }));

  return (
    <div className={`chat-page ${layout}-chat ${className}`}>
      <div className="chat-page-container">
        {/* Chat Window */}
        <ChatWindow 
          messages={messages.map((m) => ({
            id: m.id,
            content: m.content,
            sender: m.role === 'user' ? 'user' : 'ai',
            timestamp: m.createdAt ? new Date(m.createdAt) : new Date()
          }))}
          isLoading={isLoading}
          externalScrollContainerRef={scrollRef}
        />
        
        {/* Input Field (hidden when using registered overlay) */}
        {layout !== 'registered' && (
          <div className="chat-input-container">
            <InputField 
              onSubmit={handleSendMessage}
              placeholder="Hỏi mình về hồ sơ du học nè"
              disabled={isLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
});

export default ChatPage;