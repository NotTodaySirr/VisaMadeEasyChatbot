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

const GuestChatPage = forwardRef(({
  initialMessage = '',
  className = '',
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

  // When the caller explicitly requests a fresh chat
  useEffect(() => {
    if (!newChat) return;
    setMessages([]);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }, [newChat, setMessages]);

  // If a conversation id is provided (e.g. switching threads), clear current messages
  useEffect(() => {
    if (!conversationId) return;
    setMessages([]);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }, [conversationId, setMessages]);

  // Persist guest chat to session storage to allow resume-in-tab behaviour
  useEffect(() => {
    if (!messages || messages.length === 0) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      return;
    }

    try {
      const serializable = messages.map((msg) => ({ ...msg }));
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(serializable));
    } catch (e) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, [messages]);

  // Handle initial message passed via navigation state or prop
  useEffect(() => {
    if (!didInitRef.current && initialMessage.trim()) {
      didInitRef.current = true;
      handleSendMessage(initialMessage);
      if (location && location.state && location.state.initialMessage) {
        navigate('.', { replace: true, state: {} });
      }
    }
  }, [initialMessage, location, navigate]);

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

      let assistantId = `assistant-${streamId || Date.now()}`;
      let firstTokenReceived = false;

      setIsStreaming(true);
      setMessages((prev) => ([
        ...prev,
        { id: assistantId, role: 'assistant', content: '', createdAt: new Date().toISOString(), thinking: true },
      ]));

      guestStreamingService(streamId, {
        onChunk: (data) => {
          const text = data?.content || data?.delta || data?.text || '';
          setMessages((prev) => {
            const idx = prev.findIndex((m) => m.id === assistantId);
            if (idx === -1) return prev;
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
          setMessages((prev) => {
            const idx = prev.findIndex((m) => m.id === assistantId);
            if (idx === -1) return prev;
            const copy = [...prev];
            const hadAnyContent = !!copy[idx].content;
            if (!firstTokenReceived && !hadAnyContent) {
              copy[idx] = { ...copy[idx], content: 'Xin l?i, lu?ng ph?n h?i b? giï¿½n do?n.', thinking: false };
            }
            return copy;
          });
          setIsStreaming(false);
        },
      });
    } catch (e) {
      setMessages((prev) => ([
        ...prev,
        { id: `${Date.now()}-assistant-error`, role: 'assistant', content: 'Xin l?i, dï¿½ cï¿½ l?i x?y ra.', createdAt: new Date().toISOString() },
      ]));
      setIsStreaming(false);
    }
  };

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

  const hasMessages = messages && messages.length > 0;
  const isInChat = hasMessages || isStreaming;
  const disableInput = isLoading || isStreaming;

  const inChatContainerClass = ['guest-chat-in-chat-content', className].filter(Boolean).join(' ');
  const viewContainerClass = ['guest-chat-content', className].filter(Boolean).join(' ');

  const chatWindow = (
    <ChatWindow
      messages={messages.map((m) => ({
        id: m.id,
        content: m.content,
        sender: m.role === 'user' ? 'user' : 'ai',
        timestamp: m.createdAt ? new Date(m.createdAt) : new Date(),
        thinking: !!m.thinking
      }))}
      isLoading={isLoading || isStreaming}
      externalScrollContainerRef={isInChat ? scrollRef : null}
      className={isInChat ? 'guest-chat-in-chat-window' : ''}
    />
  );

  const inputFieldElement = (
    <div className={`guest-chat-input-container ${isInChat ? 'guest-chat-input-in-chat' : ''}`}>
      <InputField
        placeholder="Ask me about documents for studying abroad..."
        onSubmit={handleSendMessage}
        disabled={disableInput}
        className="guest-chat-input-field"
        showIcon={true}
        showMoreIcon={true}
      />
    </div>
  );

  return (
    <GuestLayout
      pageType={isInChat ? 'in-chat' : 'default'}
      inputField={isInChat ? inputFieldElement : null}
      scrollRef={isInChat ? scrollRef : null}
    >
      {isInChat ? (
        <div className={inChatContainerClass}>
          {chatWindow}
        </div>
      ) : (
        <div className={viewContainerClass}>
          <div className="guest-chat-main">
            <h1 className="guest-chat-title">
              Mình có thể giúp gì cho bạn?
            </h1>

            {inputFieldElement}

            <div className="guest-chat-prompt-buttons">
              {promptButtons.map((prompt, index) => (
                <PromptButton
                  key={index}
                  text={prompt}
                  onClick={() => handlePromptClick(prompt)}
                  disabled={disableInput}
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
      )}
    </GuestLayout>
  );
});

export default GuestChatPage;






