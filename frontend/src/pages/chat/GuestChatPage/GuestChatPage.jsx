import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GuestLayout from '../../../layout/guest/GuestLayout';
import InputField from '../../../components/common/InputField/InputField';
import PromptButton from '../../../components/common/PromptButton/PromptButton';
import LoginBenefitsSection from '../../../components/common/FeatureBulletPoint/LoginBenefitsSection';
import './GuestChatPage.css';

const GuestChatPage = () => {
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  const navigate = useNavigate();

  const handleInputSubmit = (message) => {
    console.log('Message submitted:', message);
    // Handle message submission logic here
  };

  const handlePromptClick = (promptText) => {
    console.log('Prompt clicked:', promptText);
    // Handle prompt click logic here
  };

  const handleLoginClick = () => {
    navigate('/auth/login');
  };

  const promptButtons = [
    'Research',
    'Check progress', 
    'Update information',
    'Summarize'
  ];

  return (
    <GuestLayout pageType="default">
      <div className="guest-chat-content">
        <div className="guest-chat-main">
          <h1 className="guest-chat-title">
            How can I help you today?
          </h1>
          
          <div className="guest-chat-input-container">
            <InputField
              placeholder="Ask me about documents for studying abroad..."
              onSubmit={handleInputSubmit}
              disabled={isInputDisabled}
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
                onClick={handlePromptClick}
                disabled={isInputDisabled}
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
};

export default GuestChatPage;
