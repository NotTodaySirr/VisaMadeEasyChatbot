import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChatWindow } from '../../../components/chat';
import { InputField } from '../../../components/common';
import './ChatPage.css';

const ChatPage = forwardRef(({ 
  initialMessage = '',
  className = "",
  layout = 'guest', // 'guest' | 'registered'
  scrollRef = null
}, ref) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const didInitRef = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();

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

  // Expose send method for external input (registered layout)
  useImperativeHandle(ref, () => ({
    sendMessage: (text) => handleSendMessage(text)
  }));

  return (
    <div className={`chat-page ${layout}-chat ${className}`}>
      <div className="chat-page-container">
        {/* Chat Window */}
        <ChatWindow 
          messages={messages}
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