import React, { useState, useEffect } from 'react';
import { ChatWindow } from '../../../components/chat';
import { InputField } from '../../../components/common';
import './ChatPage.css';

const ChatPage = ({ 
  initialMessage = '',
  className = "",
  layout = 'guest' // 'guest' | 'registered'
}) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Handle initial message
  useEffect(() => {
    if (initialMessage.trim()) {
      handleSendMessage(initialMessage);
    }
  }, [initialMessage]);

  const handleSendMessage = async (message) => {
    if (!message.trim() || isLoading) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      content: message,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Simulate AI response (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const aiMessage = {
        id: Date.now() + 1,
        content: `Tôi đã nhận được câu hỏi của bạn: "${message}". Đây là phản hồi mẫu từ AI assistant về vấn đề du học và visa.`,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`chat-page ${layout}-chat ${className}`}>
      <div className="chat-page-container">
        {/* Chat Window */}
        <ChatWindow 
          messages={messages}
          isLoading={isLoading}
        />
        
        {/* Input Field */}
        <div className="chat-input-container">
          <InputField 
            onSubmit={handleSendMessage}
            placeholder="Hỏi mình về hồ sơ du học nè"
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;