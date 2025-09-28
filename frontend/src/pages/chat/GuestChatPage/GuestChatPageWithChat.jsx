import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { guestChatService, guestStreamingService } from '../../../services/chat/index.js';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChatWindow } from '../../../components/chat';
import { InputField } from '../../../components/common';
import GuestLayout from '../../../layout/guest/GuestLayout';
import LoginBenefitsSection from '../../../components/common/FeatureBulletPoint/LoginBenefitsSection';
import PromptButton from '../../../components/common/PromptButton/PromptButton';
import './GuestChatPage.css';

const SESSION_STORAGE_KEY = 'guest_chat_messages';

const GuestChatPageWithChat = forwardRef(({ 
  initialMessage = '',
  className = "",
  scrollRef = null,
  conversationId = null,
  newChat = false,
}, ref) => {
  const { messages, append, isLoading, setMessages } = useChat({});
  const [isStreaming, setIsStreaming] = useState(false);
  const didInitRef = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Load guest chat history from session storage if available
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setMessages(parsed);
          return;
        }
      }
    } catch (e) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
    setMessages([]);
  }, [setMessages]);

  // When starting a brand-new chat or switching to no id, clear current messages
  useEffect(() => {
    if (!conversationId || newChat) {
      setMessages([]);
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, [conversationId, newChat, setMessages]);

  // Persist guest chat to session storage for simple resume-in-tab behaviour
  useEffect(() => {
    if (!messages || messages.length === 0) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      return;
    }

    try {
      const serializable = messages.map((msg) => ({ ...msg }));
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(serializable));
    } catch (e) {
      // If serialization fails, clear storage to avoid stale data
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, [messages]);

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

    const sanitizedHistory = messages
      .filter((m) => m.role === 'user' || (m.role === 'assistant' && m.content && m.content.trim() !== ''))
      .map((m) => ({
        role: m.role,
        content: m.content ?? '',
      }));

    const conversationPayload = [
      ...sanitizedHistory,
      { role: 'user', content: message },
    ];

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
      const resp = await guestChatService.sendMessage({ messages: conversationPayload });
      const { stream_id: streamId } = resp || {};
      if (!streamId) {
        throw new Error('Stream id missing in response');
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
      guestStreamingService(streamId, {
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

  // Expose send method for external input
  useImperativeHandle(ref, () => ({
    sendMessage: (text) => handleSendMessage(text)
  }));

  const handleLoginClick = () => {
    navigate('/auth/login');
  };

  const promptButtons = [
    'Research',
    'Check progress', 
    'Update information',
    'Summarize'
  ];

  const handlePromptClick = (promptText) => {
    handleSendMessage(promptText);
  };

  return (
    <GuestLayout pageType="default">
      <div className="guest-chat-content">
        <div className="guest-chat-main">
          <h1 className="guest-chat-title">
            How can I help you today?
          </h1>
          
          {/* Chat Window */}
          <div className="guest-chat-window-container">
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
          
          <div className="guest-chat-input-container">
            <InputField
              placeholder="Ask me about documents for studying abroad..."
              onSubmit={handleSendMessage}
              disabled={isLoading}
              className="guest-chat-input-field"
              showIcon={true}
              showMoreIcon={true}
            />
          </div>
          
          <div className="guest-chat-prompt-buttons">
            {promptButtons.map((prompt, index) => (
              <PromptButton
                key={index}
                text={prompt}
                onClick={() => handlePromptClick(prompt)}
                disabled={isLoading}
                className="guest-chat-prompt-button"
                variant="default"
              />
            ))}
          </div>
          
          <div className="guest-chat-benefits">
            <LoginBenefitsSection
              onLoginClick={handleLoginClick}
              className="guest-chat-login-section"
            />
          </div>
        </div>
      </div>
    </GuestLayout>
  );
});

export default GuestChatPageWithChat;
