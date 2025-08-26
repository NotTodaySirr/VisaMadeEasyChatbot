import React from 'react';
import './TechPartnerCard.css';

const TechPartnerCard = ({ partner }) => {
    const { name, logoUrl, logoColor } = partner;

    const renderLogo = () => {
        if (logoUrl) {
            return <img src={logoUrl} alt={name} className="tech-logo-image" />;
        }
        
        // Placeholder logo based on name and color
        return (
            <div 
                className="tech-logo-placeholder"
                style={{ backgroundColor: logoColor }}
            >
                {name.substring(0, 2).toUpperCase()}
            </div>
        );
    };

    return (
        <div className="tech-partner-card">
            <div className="tech-logo">
                {renderLogo()}
            </div>
            <p className="tech-name">{name}</p>
        </div>
    );
};

export default TechPartnerCard;