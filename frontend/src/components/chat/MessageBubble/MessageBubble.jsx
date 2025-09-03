import React from 'react';
import './MessageBubble.css';

const MessageBubble = ({ 
  message, 
  sender = 'user', // 'user' | 'ai'
  timestamp, 
  isLoading = false 
}) => {
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (isLoading) {
    return (
      <div className={`message-bubble ai-message loading`}>
        <div className="message-content">
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="message-text">Đang suy nghĩ...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`message-bubble ${sender}-message`}>
      <div className="message-content">
        <div className="message-text">{message}</div>
        {timestamp && (
          <div className="message-timestamp">
            {formatTimestamp(timestamp)}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;