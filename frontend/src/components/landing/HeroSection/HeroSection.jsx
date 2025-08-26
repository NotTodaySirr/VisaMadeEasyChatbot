import React from 'react';
import './HeroSection.css';

// Import decorative SVG assets
import decorators from '../../../assets/landing/decorators.svg';
import chatbotIcon from '../../../assets/chatbot.svg';

const HeroSection = () => {
    return (
        <section className="hero-section">
            {/* Decorative background elements */}
            <div className="hero-decorations">
                <img src={decorators} alt="" className="decorators-background" />
            </div>
            
            <div className="hero-content">
                <div className="hero-brand">
                    <div className="hero-logo">
                        <img src={chatbotIcon} alt="Chatbot" className="chatbot-icon" />
                        <span className="logo-text">visamadeeasy</span>
                    </div>
                </div>
                <h1 className="hero-title">Trợ thủ AI cho hồ sơ du học của bạn</h1>
            </div>
        </section>
    );
};

export default HeroSection;