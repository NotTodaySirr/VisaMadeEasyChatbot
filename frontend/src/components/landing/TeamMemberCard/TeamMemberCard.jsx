import React from 'react';
import './TeamMemberCard.css';

const TeamMemberCard = ({ member }) => {
    const { name, role, linkedinUrl, location, profileColor, profileImage } = member;

    const renderProfileImage = () => {
        if (profileImage) {
            return <img src={profileImage} alt={name} className="team-member-image" />;
        }
        return (
            <div 
                className="team-member-placeholder"
                style={{ backgroundColor: profileColor }}
            >
                {name.split(' ').map(part => part[0]).join('').substring(0, 2)}
            </div>
        );
    };

    const renderIcon = (type) => {
        switch (type) {
            case 'briefcase':
                return (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 4H11V3C11 2.447 10.553 2 10 2H6C5.447 2 5 2.447 5 3V4H2C1.447 4 1 4.447 1 5V12C1 12.553 1.447 13 2 13H14C14.553 13 15 12.553 15 12V5C15 4.447 14.553 4 14 4ZM6 3H10V4H6V3Z" fill="#6B7280"/>
                    </svg>
                );
            case 'linkedin':
                return (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14.5 0H1.5C0.675 0 0 0.675 0 1.5V14.5C0 15.325 0.675 16 1.5 16H14.5C15.325 16 16 15.325 16 14.5V1.5C16 0.675 15.325 0 14.5 0ZM4.75 13.5H2.5V6H4.75V13.5ZM3.625 4.95C2.95 4.95 2.4 4.4 2.4 3.725C2.4 3.05 2.95 2.5 3.625 2.5C4.3 2.5 4.85 3.05 4.85 3.725C4.85 4.4 4.3 4.95 3.625 4.95ZM13.5 13.5H11.25V9.9C11.25 9 11.235 7.85 10 7.85C8.75 7.85 8.55 8.8 8.55 9.825V13.5H6.3V6H8.45V7.075H8.475C8.775 6.525 9.525 5.95 10.675 5.95C12.975 5.95 13.5 7.425 13.5 9.375V13.5Z" fill="#0077B5"/>
                    </svg>
                );
            case 'location':
                return (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 0C5.24 0 3 2.24 3 5C3 8.5 8 16 8 16S13 8.5 13 5C13 2.24 10.76 0 8 0ZM8 6.75C7.31 6.75 6.75 6.19 6.75 5.5C6.75 4.81 7.31 4.25 8 4.25C8.69 4.25 9.25 4.81 9.25 5.5C9.25 6.19 8.69 6.75 8 6.75Z" fill="#EF4444"/>
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <div className="team-member-card">
            <div className="team-member-photo">
                {renderProfileImage()}
            </div>
            <div className="team-member-info">
                <h3 className="team-member-name">{name}</h3>
                <div className="team-member-role">
                    {renderIcon('briefcase')}
                    <span>{role}</span>
                </div>
                <div className="team-member-linkedin">
                    {renderIcon('linkedin')}
                    <a href={`https://linkedin.com/in${linkedinUrl}`} target="_blank" rel="noopener noreferrer">
                        {linkedinUrl}
                    </a>
                </div>
                <div className="team-member-location">
                    {renderIcon('location')}
                    <span>{location}</span>
                </div>
            </div>
        </div>
    );
};

export default TeamMemberCard;