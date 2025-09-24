import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
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
  newChat = false,
}, ref) => {
  const { messages, append, isLoading, setMessages } = useChat({});
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(conversationId || null);
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
        setActiveConversationId(conversationId);
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, [conversationId]);

  // When starting a brand-new chat or switching to no id, clear current messages
  useEffect(() => {
    if (!conversationId || newChat) {
      setMessages([]);
    }
  }, [conversationId, newChat, setMessages]);

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
    if (!message.trim()) return;
    try {
      // Best-effort: append to local chat state; ignore transport errors
      await append({ role: 'user', content: message });
    } catch {
      setMessages((prev) => ([
        ...prev,
        { id: `${Date.now()}-user`, role: 'user', content: message, createdAt: new Date().toISOString() },
      ]));
    }

    try {
      const convIdForSend = activeConversationId || conversationId || null;
      const resp = await chatService.sendMessage({ content: message, conversationId: convIdForSend });
      const { stream_id: streamId, message_id: serverMessageId, conversation_id: convId, title } = resp || {};

      // Smart send: if new conversation created, reflect it
      if (convId && !conversationId) {
        setActiveConversationId(convId);
        navigate(`/chat/in/${convId}`, { replace: true, state: {} });
      }

      let assistantId = serverMessageId || `${Date.now()}-assistant`;
      let hasInserted = false;

      setIsStreaming(true);
      openStream(streamId, {
        onChunk: (data) => {
          const text = data?.content || data?.delta || data?.text || '';
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
          setIsStreaming(false);
        },
        onError: () => {
          if (!hasInserted) {
            setMessages((prev) => ([
              ...prev,
              { id: `${assistantId}-error`, role: 'assistant', content: 'Xin lỗi, luồng phản hồi bị gián đoạn.', createdAt: new Date().toISOString() },
            ]));
          }
          setIsStreaming(false);
        },
      });
    } catch (e) {
      setMessages((prev) => ([
        ...prev,
        { id: `${Date.now()}-assistant-error`, role: 'assistant', content: 'Xin lỗi, đã có lỗi xảy ra.', createdAt: new Date().toISOString() },
      ]));
      setIsStreaming(false);
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
          isLoading={isStreaming}
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