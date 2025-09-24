import React, { useEffect, useRef } from 'react';
import MessageBubble from '../MessageBubble';
import './ChatWindow.css';

const ChatWindow = ({ 
  messages = [], 
  isLoading = false,
  className = "",
  externalScrollContainerRef = null
}) => {
  const chatWindowRef = useRef(null);
  const shouldScrollRef = useRef(true);

  // Listen to external scroll container if provided to track user position
  useEffect(() => {
    const target = (externalScrollContainerRef && externalScrollContainerRef.current) || null;
    if (!target) return;

    const onScroll = () => {
      const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 50;
      shouldScrollRef.current = isNearBottom;
    };

    target.addEventListener('scroll', onScroll, { passive: true });
    return () => target.removeEventListener('scroll', onScroll);
  }, [externalScrollContainerRef]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (!shouldScrollRef.current) return;

    const target = (externalScrollContainerRef && externalScrollContainerRef.current) || chatWindowRef.current;
    if (!target) return;

    target.scrollTop = target.scrollHeight;
  }, [messages, isLoading]);

  // Handle manual scrolling
  const handleScroll = () => {
    const target = (externalScrollContainerRef && externalScrollContainerRef.current) || chatWindowRef.current;
    if (!target) return;
    const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 50;
    shouldScrollRef.current = isNearBottom;
  };

  const renderEmptyState = () => (
    <div className="chat-empty-state">
      <div className="empty-state-icon">💬</div>
      <div className="empty-state-text">
        <h3>Bắt đầu cuộc trò chuyện</h3>
        <p>Gửi tin nhắn để bắt đầu chat với trợ lý AI</p>
      </div>
    </div>
  );

  return (
    <div className={`chat-window h-full ${className}`}>
      <div 
        className="chat-messages" 
        ref={chatWindowRef}
        onScroll={handleScroll}
      >
        {messages.length === 0 && !isLoading ? (
          renderEmptyState()
        ) : (
          <div className="chat-content-container">
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id || index}
                message={message.content}
                sender={message.sender}
                timestamp={message.timestamp}
                isLoading={!!message.thinking}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;