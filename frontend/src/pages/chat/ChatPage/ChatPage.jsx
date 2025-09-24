import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { chatService, streamingService as openStream } from '../../../services/chat/index.js';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChatWindow } from '../../../components/chat';
import { InputField } from '../../../components/common';
import Spinner from '../../../components/ui/Spinner.jsx';
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
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
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
        setIsFetchingHistory(true);
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
      } finally {
        if (mounted) setIsFetchingHistory(false);
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

      // Smart send: if new conversation created, store id but DO NOT navigate yet
      // Navigating would unmount and drop the live stream; update URL after stream completes
      if (convId && !conversationId) {
        setActiveConversationId(convId);
      }

      // Use a distinct id for the assistant placeholder to avoid merging with the user message
      // Never reuse the server's user message id here
      let assistantId = `assistant-${streamId || Date.now()}`;
      let firstTokenReceived = false;

      setIsStreaming(true);
      // Insert thinking placeholder immediately where assistant response will appear
      setMessages((prev) => ([
        ...prev,
        { id: assistantId, role: 'assistant', content: '', createdAt: new Date().toISOString(), thinking: true },
      ]));
      openStream(streamId, {
        onChunk: (data) => {
          const text = data?.content || data?.delta || data?.text || '';
          setMessages((prev) => {
            const idx = prev.findIndex((m) => m.id === assistantId);
            if (idx === -1) return prev; // safety
            const copy = [...prev];
            copy[idx] = { ...copy[idx], content: (copy[idx].content || '') + text, thinking: false };
            firstTokenReceived = true;
            return copy;
          });
        },
        onComplete: () => {
          setIsStreaming(false);
          // After streaming finishes, if this was a new conversation (no prop conversationId), update URL
          if (!conversationId) {
            const finalId = activeConversationId || convId;
            if (finalId) navigate(`/chat/in/${finalId}`, { replace: true, state: {} });
          }
        },
        onError: () => {
          // Replace thinking with error if nothing streamed
          setMessages((prev) => {
            const idx = prev.findIndex((m) => m.id === assistantId);
            if (idx === -1) return prev;
            const copy = [...prev];
            const hadAnyContent = !!copy[idx].content;
            if (!firstTokenReceived && !hadAnyContent) {
              copy[idx] = { ...copy[idx], content: 'Xin lỗi, luồng phản hồi bị gián đoạn.', thinking: false };
            }
            return copy;
          });
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
      <div className="chat-page-container" style={{ position: 'relative' }}>
        {isFetchingHistory && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', zIndex: 2
          }}>
            <Spinner size={36} />
          </div>
        )}
        {/* Chat Window */}
        <div style={{ visibility: isFetchingHistory ? 'hidden' : 'visible' }}>
        <ChatWindow 
          messages={messages.map((m) => ({
            id: m.id,
            content: m.content,
            sender: m.role === 'user' ? 'user' : 'ai',
            timestamp: m.createdAt ? new Date(m.createdAt) : new Date(),
            thinking: !!m.thinking
          }))}
          isLoading={false}
          externalScrollContainerRef={scrollRef}
        />
        </div>
        
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