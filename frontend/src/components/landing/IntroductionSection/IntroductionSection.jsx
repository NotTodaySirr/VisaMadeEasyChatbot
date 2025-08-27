import React from 'react';
import ReactMarkdown from 'react-markdown';
import './IntroductionSection.css';
import { aboutUsData } from '../data/aboutUsData';
import TeamMemberCard from '../TeamMemberCard/TeamMemberCard';
import { teamData } from '../data/teamData';
// Import SVG icons
import valueIcon from '../../../assets/landing/value.svg';
import pin from '../../../assets/ui/pin.svg';
import tickBox from '../../../assets/ui/tickbox.svg';

const IntroductionSection = () => {
    const renderIcon = (iconType) => {
        switch (iconType) {
            case 'checkbox':
                return (
                    <img src={tickBox} alt="checkbox" className="bullet-icon-img" />
                );
            case 'value':
                return (
                    <img src={valueIcon} alt="value" className="bullet-icon-img" />
                );
            case 'pin':
                return (
                    <img src={pin} alt="pin" className="bullet-icon-img" />
                );
            default:
                return null;
        }
    };

    const renderBulletPoint = (item) => (
        <div key={item.id} className="bullet-point">
            <div className="bullet-icon">
                {renderIcon(item.icon)}
            </div>
            <div className="bullet-text">
                <ReactMarkdown>{item.text}</ReactMarkdown>
            </div>
        </div>
    );

    return (
        <div className="introduction-section">
            {/* Introduction */}
            <section id="gioi-thieu" className="intro-subsection">
                <div className="section-container">
                    <h2 className="section-title">{aboutUsData.introduction.title}</h2>
                    <div className="intro-content">
                        <ReactMarkdown>{aboutUsData.introduction.content}</ReactMarkdown>
                    </div>
                </div>
            </section>

            {/* Vision & Mission */}
            <section id="tam-nhin-su-menh" className="vision-mission-subsection">
                <div className="section-container">
                    <h3 className="subsection-title">{aboutUsData.visionMission.title}</h3>
                    <div className="bullet-points">
                        {aboutUsData.visionMission.items.map(renderBulletPoint)}
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section id="gia-tri-cot-loi" className="core-values-subsection">
                <div className="section-container">
                    <h3 className="subsection-title">{aboutUsData.coreValues.title}</h3>
                    <div className="bullet-points">
                        {aboutUsData.coreValues.items.map(renderBulletPoint)}
                    </div>
                </div>
            </section>

            {/* Commitments */}
            <section id="cam-ket" className="commitments-subsection">
                <div className="section-container">
                    <h3 className="subsection-title">{aboutUsData.commitments.title}</h3>
                    <div className="bullet-points">
                        {aboutUsData.commitments.items.map(renderBulletPoint)}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section id="doi-ngu" className="team-subsection">
                <div className="section-container">
                    <h3 className="subsection-title">Đội ngũ của chúng tôi</h3>
                    <div className="team-grid">
                        {teamData.map((member) => (
                            <TeamMemberCard key={member.id} member={member} />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default IntroductionSection;