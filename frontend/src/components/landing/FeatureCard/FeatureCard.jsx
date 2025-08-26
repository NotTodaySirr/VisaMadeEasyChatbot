 import React from 'react';
import './FeatureCard.css';
import airplaneIcon from '../../../assets/landing/plane.svg';
import chatbotIcon from '../../../assets/landing/chatbot.svg';
import checklistIcon from '../../../assets/landing/checklist.svg';

const FeatureCard = ({ icon, title, description }) => {
    const getIconSrc = () => {
        switch (icon) {
            case 'airplane':
                return airplaneIcon;
            case 'chatbot':
                return chatbotIcon;
            case 'checklist':
                return checklistIcon;
            default:
                return null;
        }
    };

    const iconSrc = getIconSrc();

    return (
        <div className="feature-card">
            <div className="feature-icon">
                {iconSrc && (
                    <img 
                        src={iconSrc} 
                        alt={`${title} icon`} 
                        className="feature-icon-img"
                    />
                )}
            </div>
            <div className="feature-content">
                <h3 className="feature-title">{title}</h3>
                <p className="feature-description">{description}</p>
            </div>
        </div>
    );
};

export default FeatureCard;