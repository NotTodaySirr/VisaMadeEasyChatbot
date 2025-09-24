import React, { useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import RegisteredLayout from '../../../layout/registered';
import ChatPage from '../ChatPage';
import { InputField } from '../../../components/common';

const RegisteredChatPage = () => {
  const location = useLocation();
  const params = useParams();
  const initialMessage = (location && location.state && location.state.initialMessage) || '';
  const conversationId = params.id || (location && location.state && location.state.conversationId) || null;
  const newChat = (location && location.state && location.state.newChat) || false;
  const chatRef = useRef(null);
  const scrollRef = useRef(null);

  const handleSubmit = (text) => {
    if (!text || !chatRef.current) return;
    chatRef.current.sendMessage(text);
  };

  return (
    <RegisteredLayout
      pageType="in-chat"
      scrollRef={scrollRef}
      inputField={
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 900 }}>
            <InputField onSubmit={handleSubmit} placeholder="Hỏi mình về hồ sơ du học nè" />
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className="w-full max-w-[900px] mx-auto" style={{ width: '100%' }}>
          <ChatPage ref={chatRef} initialMessage={initialMessage} layout="registered" className="registered" scrollRef={scrollRef} conversationId={conversationId} newChat={newChat} />
        </div>
      </div>
    </RegisteredLayout>
  );
};

export default RegisteredChatPage;


