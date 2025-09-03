import React from 'react';
import './ChatGreeting.css';

const ChatGreeting = ({ 
  greeting = "Mình có thể giúp gì cho bạn?",
  className = ""
}) => {
  return (
    <div className={`chat-greeting ${className}`}>
      <h1 className="chat-greeting-text">
        {greeting}
      </h1>
    </div>
  );
};

export default ChatGreeting;