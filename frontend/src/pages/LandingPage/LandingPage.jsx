import React from 'react';
import GuestLayout from '../../layout/guest/GuestLayout';
import HeroSection from '../../components/landing/HeroSection';
import FeatureCard from '../../components/landing/FeatureCard/FeatureCard';
import TeamMemberCard from '../../components/landing/TeamMemberCard/TeamMemberCard';
import { FAQSection } from '../../components/landing/FAQAccordion/FAQAccordion';
import TechPartnerCard from '../../components/landing/TechPartnerCard/TechPartnerCard';
import { featuresData } from '../../components/landing/data/featuresData';
import { teamData } from '../../components/landing/data/teamData';
import { faqData } from '../../components/landing/data/faqData';
import { techPartnersData } from '../../components/landing/data/techPartnersData';
import './LandingPage.css';

const LandingPage = () => {
    return (
        <GuestLayout pageType="default">
            <div className="landing-page">
                {/* Hero Section */}
                <HeroSection />

                {/* Features Section */}
                <section className="features-section">
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

                {/* About Section */}
                <section className="about-section">
                    <div className="about-container">
                        <h2 className="section-title">Giới thiệu</h2>
                        <div className="about-content">
                            <p className="about-intro">
                                VisaMadeEasy được khởi nguồn từ những trải nghiệm thực tế của các bạn trẻ Việt – 
                                những người từng mày mò trong mê cung thủ tục du học và cũng từng bị trì hoãn giấc mơ vì thiếu thông tin. 
                                Chúng tôi – một nhóm sinh viên trong và ngoài nước – đã quyết định cùng nhau tạo ra VisaMadeEasy: 
                                một chatbot đơn giản, miễn phí, luôn sẵn sàng hỗ trợ các bạn khác trên hành trình hội nhập toàn cầu.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section className="team-section">
                    <div className="team-container">
                        <h2 className="section-title">Đội ngũ của chúng tôi</h2>
                        <div className="team-grid">
                            {teamData.map((member) => (
                                <TeamMemberCard key={member.id} member={member} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="faq-section">
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
                <section className="tech-partners-section">
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
                                <h3 className="footer-logo">VisaMadeEasy</h3>
                                <p className="footer-tagline">Visa rõ ràng – Du học nhẹ nhàng.</p>
                            </div>
                            <div className="footer-links">
                                <h4>Tổng quan</h4>
                                <ul>
                                    <li>Giới thiệu</li>
                                    <li>Câu hỏi thường gặp</li>
                                    <li>Các phần mềm hỗ trợ</li>
                                </ul>
                            </div>
                            <div className="footer-contact">
                                <h4>Thông tin liên hệ</h4>
                                <p>Email: ...</p>
                                <p>Hotline: ... (Mr. Minh - Team lead)</p>
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