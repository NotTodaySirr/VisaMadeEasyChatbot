import React from 'react';
import { useNavigate } from 'react-router-dom';
import GuestLayout from '../../layout/guest/GuestLayout';
import HeroSection from '../../components/landing/HeroSection';
import IntroductionSection from '../../components/landing/IntroductionSection';
import FeatureCard from '../../components/landing/FeatureCard/FeatureCard';
import TeamMemberCard from '../../components/landing/TeamMemberCard/TeamMemberCard';
import { FAQSection } from '../../components/landing/FAQAccordion/FAQAccordion';
import TechPartnerCard from '../../components/landing/TechPartnerCard/TechPartnerCard';
import { featuresData } from '../../components/landing/data/featuresData';
import { teamData } from '../../components/landing/data/teamData';
import { faqData } from '../../components/landing/data/faqData';
import { techPartnersData } from '../../components/landing/data/techPartnersData';
import chatbotIcon from '../../assets/chatbot.svg';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();

    // Function to scroll to sections with smooth effect
    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            window.history.pushState(null, '', `#${sectionId}`);
        }
    };
    return (
        <GuestLayout pageType="default">
            <div className="landing-page">
                {/* Hero Section */}
                <HeroSection />

                {/* Features Section */}
                <section id="features" className="features-section">
                    <div className="features-container">
                        <h2 className="section-title">Tính năng nổi bật</h2>
                        <div className="features-grid">
                            {featuresData.map((feature) => (
                                <FeatureCard
                                    key={feature.id}
                                    icon={feature.icon}
                                    title={feature.title}
                                    description={feature.description}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Introduction Section */}
                <section id="about" className="introduction-section-wrapper">
                    <div className="introduction-container">
                        <IntroductionSection />
                    </div>
                </section>

                {/* FAQ Section */}
                <section id="faq" className="faq-section">
                    <div className="faq-container">
                        <h2 className="section-title">Câu hỏi thường gặp</h2>
                        <div className="faq-content">
                            <FAQSection categoryData={faqData.system} />
                            <FAQSection categoryData={faqData.security} />
                            <FAQSection categoryData={faqData.product} />
                        </div>
                    </div>
                </section>

                {/* Tech Partners Section */}
                <section id="tech-partners" className="tech-partners-section">
                    <div className="tech-partners-container">
                        <h2 className="section-title">Các phần mềm hỗ trợ</h2>
                        <div className="tech-partners-grid">
                            {techPartnersData.map((partner) => (
                                <TechPartnerCard key={partner.id} partner={partner} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="landing-footer">
                    <div className="footer-container">
                        <div className="footer-content">
                            <div className="footer-brand">
                                <div className="footer-logo">
                                    <div className="footer-logo-icon">
                                        <img src={chatbotIcon} alt="Chatbot" className="footer-logo-svg" />
                                    </div>
                                    <span className="footer-logo-text">
                                        <span className="footer-logo-visamade">visamade</span><span className="footer-logo-easy">easy</span>
                                    </span>
                                </div>
                                <p className="footer-tagline">Visa rõ ràng – Du học nhẹ nhàng.</p>
                            </div>
                            <div className="footer-contact">
                                <h4>Thông tin liên hệ</h4>
                                <p>Email: ...</p>
                                <p>Hotline: ... (Mr. Minh - Team lead)</p>
                            </div>
                            <div className="footer-links">
                                <h4>Tổng quan</h4>
                                <ul>
                                    <li>
                                        <button 
                                            onClick={() => scrollToSection('about')} 
                                            className="footer-link-button"
                                        >
                                            Giới thiệu
                                        </button>
                                    </li>
                                    <li>
                                        <button 
                                            onClick={() => scrollToSection('faq')} 
                                            className="footer-link-button"
                                        >
                                            Câu hỏi thường gặp
                                        </button>
                                    </li>
                                    <li>
                                        <button 
                                            onClick={() => scrollToSection('tech-partners')} 
                                            className="footer-link-button"
                                        >
                                            Các phần mềm hỗ trợ
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="footer-copyright">
                            <p>Copyright © 2025 VisaMadeEasy. All Rights Reserved</p>
                        </div>
                    </div>
                </footer>
            </div>
        </GuestLayout>
    );
};

export default LandingPage;