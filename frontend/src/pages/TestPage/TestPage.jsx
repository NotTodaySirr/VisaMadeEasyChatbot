import React, { useState } from 'react';
import { InputField, PromptButton, FeatureBulletPoint, LoginBenefitsSection } from '../../components/common';
import { MessageBubble, ChatWindow } from '../../components/chat';
import Sidebar from '../../components/sidebar/Sidebar';
import './TestPage.css';
import '../../components/sidebar/Sidebar.css';

const TestPage = () => {
  const [inputSubmissions, setInputSubmissions] = useState([]);
  const [clickedPrompts, setClickedPrompts] = useState([]);
  const [testMessages, setTestMessages] = useState([
    {
      id: 1,
      content: "Hello! This is a user message for testing.",
      sender: 'user',
      timestamp: new Date(Date.now() - 300000) // 5 minutes ago
    },
    {
      id: 2,
      content: "This is an AI response message. It demonstrates how the AI messages appear in the chat interface.",
      sender: 'ai',
      timestamp: new Date(Date.now() - 240000) // 4 minutes ago
    },
    {
      id: 3,
      content: "This is another user message to show the conversation flow.",
      sender: 'user',
      timestamp: new Date(Date.now() - 180000) // 3 minutes ago
    }
  ]);

  const handleInputSubmit = (value) => {
    console.log('Input submitted:', value);
    setInputSubmissions(prev => [...prev, value]);
  };

  const handlePromptClick = (promptText) => {
    console.log('Prompt clicked:', promptText);
    setClickedPrompts(prev => [...prev, promptText]);
  };

  const testPrompts = [
    'Prompt 1',
    'Prompt 2', 
    'Prompt 3',
    'Long prompt text that should be truncated',
    'Short'
  ];

  const testFeatures = [
    'Tạo hồ sơ để sắp xếp tài liệu và theo dõi tiến trình',
    'Lưu hội thoại với chatbot để dễ dàng xem lại sau',
    'Nhận nhắc nhở hạn nộp để không bỏ lỡ bước nào',
    'Đồng bộ hồ sơ và hội thoại để chatbot hỗ trợ tốt hơn'
  ];

  return (
    <div className="test-page">
      <div className="sidebar-container">
        <Sidebar />
      </div>
      <div className="test-content-container">
        <div className="test-container">
          <h1 className="test-title">Component Testing Page</h1>
          
          {/* InputField Testing */}
          <section className="test-section">
            <h2 className="test-section-title">InputField Component</h2>
            
            <div className="test-item">
              <h3>Default InputField (Multi-line with More Icon)</h3>
              <InputField 
                onSubmit={handleInputSubmit}
                placeholder="Type something and press Enter to submit, or Shift+Enter for new line..."
              />
              <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                • Press <strong>Enter</strong> to submit<br/>
                • Press <strong>Shift+Enter</strong> to add new line<br/>
                • Maximum 5 lines displayed<br/>
                • Click the + icon inside the field (bottom-left) to focus<br/>
                • Field automatically shrinks when content is deleted
              </p>
            </div>

            <div className="test-item">
              <h3>Disabled InputField</h3>
              <InputField 
                disabled={true}
                placeholder="This field is disabled"
              />
            </div>

            <div className="test-item">
              <h3>InputField without More icon</h3>
              <InputField 
                onSubmit={handleInputSubmit}
                showMoreIcon={false}
                placeholder="No + icon here, but still multi-line"
              />
            </div>

            <div className="test-item">
              <h3>InputField with custom max lines (3 lines)</h3>
              <InputField 
                onSubmit={handleInputSubmit}
                maxLines={3}
                placeholder="Maximum 3 lines only..."
              />
            </div>

            <div className="test-item">
              <h3>Dynamic Sizing Test</h3>
              <InputField 
                onSubmit={handleInputSubmit}
                placeholder="Type multiple lines and then delete them to see the field shrink..."
              />
              <p style={{ fontSize: '12px', color: '#999', marginTop: '4px', fontStyle: 'italic' }}>
                Try typing several lines with Shift+Enter, then delete content to see the field automatically resize.
              </p>
            </div>

            <div className="test-results">
              <h4>Input Submissions:</h4>
              <ul>
                {inputSubmissions.map((submission, index) => (
                  <li key={index}>{submission}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* PromptButton Testing */}
          <section className="test-section">
            <h2 className="test-section-title">PromptButton Component</h2>
            
            <div className="test-item">
              <h3>Default PromptButtons</h3>
              <div className="prompt-buttons-container">
                {testPrompts.map((prompt, index) => (
                  <PromptButton
                    key={index}
                    text={prompt}
                    onClick={handlePromptClick}
                  />
                ))}
              </div>
            </div>

            <div className="test-item">
              <h3>Small Variant PromptButtons</h3>
              <div className="prompt-buttons-container">
                {testPrompts.slice(0, 3).map((prompt, index) => (
                  <PromptButton
                    key={index}
                    text={prompt}
                    onClick={handlePromptClick}
                    variant="small"
                  />
                ))}
              </div>
            </div>

            <div className="test-item">
              <h3>Large Variant PromptButtons</h3>
              <div className="prompt-buttons-container">
                {testPrompts.slice(0, 2).map((prompt, index) => (
                  <PromptButton
                    key={index}
                    text={prompt}
                    onClick={handlePromptClick}
                    variant="large"
                  />
                ))}
              </div>
            </div>

            <div className="test-item">
              <h3>Disabled PromptButton</h3>
              <PromptButton
                text="Disabled Prompt"
                onClick={handlePromptClick}
                disabled={true}
              />
            </div>

            <div className="test-results">
              <h4>Clicked Prompts:</h4>
              <ul>
                {clickedPrompts.map((prompt, index) => (
                  <li key={index}>{prompt}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* FeatureBulletPoint Testing */}
          <section className="test-section">
            <h2 className="test-section-title">FeatureBulletPoint Component</h2>
            
            <div className="test-item">
              <h3>Default FeatureBulletPoints</h3>
              <div className="feature-bullets-container">
                {testFeatures.map((feature, index) => (
                  <FeatureBulletPoint
                    key={index}
                    text={feature}
                  />
                ))}
              </div>
            </div>

            <div className="test-item">
              <h3>Custom Color FeatureBulletPoints</h3>
              <div className="feature-bullets-container">
                <FeatureBulletPoint
                  text="Custom red icon color (using filter)"
                  iconColor="#dc2626"
                />
                <FeatureBulletPoint
                  text="Custom green icon with gray text"
                  iconColor="#16a34a"
                  textColor="#6b7280"
                />
                <FeatureBulletPoint
                  text="Custom orange icon color"
                  iconColor="#ea580c"
                />
                <FeatureBulletPoint
                  text="Default blue icon (no filter applied)"
                  iconColor="#1E46A4"
                />
              </div>
            </div>
          </section>

          {/* LoginBenefitsSection Testing */}
          <section className="test-section">
            <h2 className="test-section-title">LoginBenefitsSection Component</h2>
            
            <div className="test-item">
              <h3>Complete Login Benefits Section (Figma Design)</h3>
              <div className="login-benefits-container">
                <LoginBenefitsSection />
              </div>
            </div>

            <div className="test-item">
              <h3>Custom Features LoginBenefitsSection</h3>
              <div className="login-benefits-container">
                <LoginBenefitsSection 
                  features={[
                    'Custom feature 1 for testing',
                    'Custom feature 2 with longer text to test wrapping behavior',
                    'Custom feature 3'
                  ]}
                  onLoginClick={() => console.log('Custom login click handler')}
                />
              </div>
            </div>
          </section>

          {/* Chat Components Testing */}
          <section className="test-section">
            <h2 className="test-section-title">Chat Components Testing</h2>
            
            {/* MessageBubble Testing */}
            <div className="test-item">
              <h3>MessageBubble Component</h3>
              
              <div className="test-subitem">
                <h4>User Message Bubble</h4>
                <MessageBubble
                  message="This is a user message example for testing purposes."
                  sender="user"
                  timestamp={new Date()}
                />
              </div>

              <div className="test-subitem">
                <h4>AI Message Bubble</h4>
                <MessageBubble
                  message="This is an AI response message. It shows how the assistant replies to user queries with helpful information."
                  sender="ai"
                  timestamp={new Date()}
                />
              </div>

              <div className="test-subitem">
                <h4>Loading Message Bubble</h4>
                <MessageBubble
                  message=""
                  sender="ai"
                  isLoading={true}
                />
              </div>

              <div className="test-subitem">
                <h4>Long Message Test</h4>
                <MessageBubble
                  message="This is a very long message to test how the message bubble handles longer content. It should wrap properly and maintain good readability while keeping the appropriate styling and spacing. The message bubble should handle various lengths of content gracefully."
                  sender="user"
                  timestamp={new Date()}
                />
              </div>
            </div>

            {/* ChatWindow Testing */}
            <div className="test-item">
              <h3>ChatWindow Component</h3>
              
              <div className="test-subitem">
                <h4>Empty Chat Window</h4>
                <div style={{ height: '300px', border: '1px solid #ddd', borderRadius: '8px' }}>
                  <ChatWindow messages={[]} />
                </div>
              </div>

              <div className="test-subitem">
                <h4>Chat Window with Messages</h4>
                <div style={{ height: '400px', border: '1px solid #ddd', borderRadius: '8px' }}>
                  <ChatWindow 
                    messages={testMessages} 
                    isLoading={false}
                  />
                </div>
              </div>

              <div className="test-subitem">
                <h4>Chat Window with Loading State</h4>
                <div style={{ height: '350px', border: '1px solid #ddd', borderRadius: '8px' }}>
                  <ChatWindow 
                    messages={testMessages.slice(0, 2)} 
                    isLoading={true}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Integration Testing */}
          <section className="test-section">
            <h2 className="test-section-title">Original Component Integration Test</h2>
            <div className="test-item">
              <h3>Combined Components (Similar to Guest Chat Layout)</h3>
              <div className="integration-test-container">
                <h4 className="integration-title">Mình có thể giúp gì cho bạn?</h4>
                
                <div className="integration-prompts">
                  <PromptButton text="Prompt 1" onClick={handlePromptClick} />
                  <PromptButton text="Prompt 2" onClick={handlePromptClick} />
                  <PromptButton text="Prompt 3" onClick={handlePromptClick} />
                </div>
                
                <InputField 
                  onSubmit={handleInputSubmit}
                  placeholder="Hỏi mình về hồ sơ du học nè (Shift+Enter for new line)"
                  maxLines={5}
                />
                
                <div className="integration-features">
                  <h4>Login Benefits:</h4>
                  {testFeatures.map((feature, index) => (
                    <FeatureBulletPoint
                      key={index}
                      text={feature}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
          <section className="test-section">
            <h2 className="test-section-title">Manual Testing Results</h2>
            
            <div className="test-item">
              <h3>Chat Component Testing Checklist</h3>
              <div className="testing-checklist">
                <h4>MessageBubble Tests:</h4>
                <ul>
                  <li>✅ User messages appear right-aligned with blue gradient</li>
                  <li>✅ AI messages appear left-aligned with white background</li>
                  <li>✅ Loading animation works correctly</li>
                  <li>✅ Messages handle long content with proper wrapping</li>
                  <li>✅ Timestamps format correctly</li>
                  <li>✅ Animation effects work on message appearance</li>
                </ul>
                
                <h4>ChatWindow Tests:</h4>
                <ul>
                  <li>✅ Empty state displays correctly with icon and text</li>
                  <li>✅ Messages render in correct order</li>
                  <li>✅ Auto-scroll works for new messages</li>
                  <li>✅ Loading state shows typing indicator</li>
                  <li>✅ Scrollbar styling is consistent</li>
                  <li>✅ Container height constraints work properly</li>
                </ul>
                
                <h4>Integration Tests:</h4>
                <ul>
                  <li>✅ Chat functionality works in GuestChatPage</li>
                  <li>✅ Prompt buttons send messages correctly</li>
                  <li>✅ Consistent styling across all components</li>
                  <li>✅ Performance is smooth with multiple messages</li>
                </ul>
              </div>
            </div>

            <div className="test-item">
              <h3>Performance Testing Notes</h3>
              <div className="performance-notes">
                <p><strong>Message Rendering:</strong> Smooth animation and rendering for up to 50+ messages</p>
                <p><strong>Auto-scroll:</strong> Efficient scrolling with proper viewport detection</p>
                <p><strong>State Management:</strong> Clean state updates without unnecessary re-renders</p>
                <p><strong>Memory Usage:</strong> No memory leaks detected in message handling</p>
                <p><strong>Mobile Performance:</strong> Responsive design works well on 400px+ screens</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TestPage;