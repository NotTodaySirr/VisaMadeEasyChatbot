import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GuestLayout from '../../../layout/guest';
import ChatGreeting from '../../../components/common/ChatGreeting/ChatGreeting';
import InputField from '../../../components/common/InputField/InputField';
import PromptButton from '../../../components/common/PromptButton/PromptButton';
import { LoginBenefitsSection } from '../../../components/common';
import { ChatWindow } from '../../../components/chat';
import Sidebar from '../../../components/sidebar/Sidebar';

const GuestChatPage = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    const promptButtons = [ "Tra cứu", "Kiểm tra tiến độ", "Cập nhật thông tin", "Tóm tắt văn bản" ];

    const handleSendMessage = async (message) => {
        if (!message.trim() || isLoading) return;

        const userMessage = { id: Date.now(), content: message, sender: 'user', timestamp: new Date() };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const aiMessage = {
                id: Date.now() + 1,
                content: `Tôi đã nhận được câu hỏi của bạn: "${message}". Đây là phản hồi mẫu từ AI assistant.`,
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            // Handle error message display if needed
        } finally {
            setIsLoading(false);
        }
    };

    const handlePromptClick = (promptText) => {
        handleSendMessage(promptText);
    };

    // Reusable component for the input field to keep code DRY
    const ChatInput = () => (
        <InputField
            placeholder="Hỏi mình về hồ sơ du học nè"
            onSubmit={handleSendMessage}
            disabled={isLoading}
        />
    );

    const renderInputField = () => (
        <div className="w-full max-w-[760px] p-4">
            <ChatInput />
        </div>
    );

    if (messages.length === 0) {
        // STATE 1: Initial Greeting View (no messages) - Normal layout
        return (
            <GuestLayout pageType="started">
                <div className="flex flex-col items-center w-full max-w-4xl mx-auto py-8 px-4">
                    <ChatGreeting greeting="Mình có thể giúp gì cho bạn?" />
                    <div className="w-full max-w-[760px] mt-10">
                        <ChatInput />
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 w-full max-w-[760px] mt-10">
                        {promptButtons.map((text, index) => (
                            <PromptButton key={index} text={text} onClick={handlePromptClick} />
                        ))}
                    </div>
                    <div className="w-full max-w-[760px] mt-16 md:mt-20">
                        <LoginBenefitsSection onLoginClick={() => navigate('/auth/login')} />
                    </div>
                </div>
            </GuestLayout>
        );
    }

    // STATE 2: Active Chat View (messages exist) - In-chat layout
    return (
        <GuestLayout
            pageType="in-chat"
            inputField={renderInputField()}
            scrollRef={scrollRef}
        >
            <ChatWindow messages={messages} isLoading={isLoading} externalScrollContainerRef={scrollRef} />
        </GuestLayout>
    );
};

export default GuestChatPage;