import React, { useEffect, useRef } from 'react';
import MessageBubble from '../MessageBubble';
import './ChatWindow.css';

const ChatWindow = ({ 
  messages = [], 
  isLoading = false,
  className = "" 
}) => {
  const chatWindowRef = useRef(null);
  const shouldScrollRef = useRef(true);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (shouldScrollRef.current && chatWindowRef.current) {
      const chatWindow = chatWindowRef.current;
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }
  }, [messages, isLoading]);

  // Handle manual scrolling
  const handleScroll = () => {
    if (chatWindowRef.current) {
      const chatWindow = chatWindowRef.current;
      const isNearBottom = chatWindow.scrollHeight - chatWindow.scrollTop - chatWindow.clientHeight < 50;
      shouldScrollRef.current = isNearBottom;
    }
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
    <div className={`chat-window ${className}`}>
      <div 
        className="chat-messages" 
        ref={chatWindowRef}
        onScroll={handleScroll}
      >
        {messages.length === 0 && !isLoading ? (
          renderEmptyState()
        ) : (
          <>
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id || index}
                message={message.content}
                sender={message.sender}
                timestamp={message.timestamp}
              />
            ))}
            {isLoading && (
              <MessageBubble
                message=""
                sender="ai"
                isLoading={true}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;