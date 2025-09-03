import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Header.css';
import chatbotIcon from '../../assets/chatbot.svg';
import defaultAvatar from '/avatars/figma-avatar.svg';

const Header = ({ isLoggedIn = false, pageType = 'default', user = null }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Determine if we're on login or register pages for active state styling
    const isOnLoginPage = location.pathname === '/auth/login';
    const isOnRegisterPage = location.pathname === '/auth/register';
    const isOnLandingPage = location.pathname === '/landing' || location.pathname === '/';

    // State for dropdown menu (for future use)
    const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);

    // Handle scroll to section for landing page navigation
    useEffect(() => {
        if (location.hash) {
            const sectionId = location.hash.substring(1);
            const element = document.getElementById(sectionId);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [location.hash]);

    // Function to scroll to sections with smooth effect
    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            window.history.pushState(null, '', `#${sectionId}`);
        } else if (location.pathname !== '/') {
            navigate(`/#${sectionId}`);
        }
    };

    const handleLogout = () => {
        // Future: Add actual logout logic
        console.log('User logged out');
        navigate('/auth/login');
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setIsMoreOptionsOpen(false);
        };

        if (isMoreOptionsOpen) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isMoreOptionsOpen]);

    const renderLogo = () => (
        <Link to={isLoggedIn ? "/home" : "/"} className="topbar-logo">
            <div className="logo-icon">
                <img src={chatbotIcon} alt="Chatbot" className="logo-svg" />
            </div>
            <span className="logo-text">
                <span className="logo-visamade">VisaMade</span><span className="logo-easy">Easy</span>
            </span>
        </Link>
    );

    // Get TopBar classes based on state
    const getTopBarClasses = () => {
        if (!isLoggedIn) {
            if (pageType === 'in-chat') {
                return "topbar topbar-not-logged-in-chat";
            } else if (pageType === 'started') {
                return "topbar topbar-not-logged-in-started";
            } else {
                return "topbar topbar-not-logged-in-default";
            }
        } else {
            if (pageType === 'in-chat') {
                return "topbar topbar-logged-in-chat";
            } else {
                return "topbar topbar-logged-in-default";
            }
        }
    };

    // Render the main Header content
    let headerContent;

    if (!isLoggedIn) {
        if (pageType === 'in-chat') {
            headerContent = (
                <>
                    <div className="topbar-left">
                        <button className="topbar-icon-button">
                            {/* Edit Icon placeholder - will be replaced with actual icon */}
                            <div className="topbar-icon"></div>
                        </button>
                        {renderLogo()}
                    </div>
                    <div className="topbar-center">
                        <Link to="/" className="topbar-link">
                            Trang chủ
                        </Link>
                        <Link to="/chat/guest" className="topbar-link">
                            Chatbot
                        </Link>
                    </div>
                    <div className="topbar-right">
                        <Link to="/auth/login" className={`topbar-button ${
                            isOnLoginPage 
                                ? 'topbar-button-login-active' 
                                : 'topbar-button-login'
                        }`}>
                            Đăng nhập
                        </Link>
                        <Link to="/auth/register" className={`topbar-button ${
                            isOnRegisterPage 
                                ? 'topbar-button-register-active' 
                                : 'topbar-button-register'
                        }`}>
                            Đăng ký
                        </Link>
                    </div>
                </>
            );
        } else if (pageType === 'started') {
            headerContent = (
                <>
                    <div className="topbar-left">
                        {renderLogo()}
                    </div>
                    <div className="topbar-center">
                        <Link to="/" className="topbar-link">
                            Trang chủ
                        </Link>
                        <Link to="/chat/guest" className="topbar-link">
                            Chatbot
                        </Link>
                    </div>
                    <div className="topbar-right">
                        <Link to="/auth/login" className={`topbar-button ${
                            isOnLoginPage 
                                ? 'topbar-button-login-alt-active' 
                                : 'topbar-button-login-alt'
                        }`}>
                            Đăng nhập
                        </Link>
                        <Link to="/auth/register" className={`topbar-button ${
                            isOnRegisterPage 
                                ? 'topbar-button-register-alt-active' 
                                : 'topbar-button-register-alt'
                        }`}>
                            Đăng ký
                        </Link>
                    </div>
                </>
            );
        } else {
            // Default landing page
            headerContent = (
                <>
                    <div className="topbar-left">
                        {renderLogo()}
                    </div>
                    <div className="topbar-center">
                        <button onClick={() => scrollToSection('features')} className="topbar-link">
                            Tính năng
                        </button>
                        <button onClick={() => scrollToSection('about')} className="topbar-link">
                            Về chúng tôi
                        </button>
                        <button onClick={() => scrollToSection('faq')} className="topbar-link">
                            FAQs
                        </button>
                    </div>
                    <div className="topbar-right">
                        <Link to="/auth/login" className={`topbar-button ${
                            isOnLoginPage 
                                ? 'topbar-button-login-active' 
                                : 'topbar-button-login'
                        }`}>
                            Đăng nhập
                        </Link>
                        <Link to="/auth/register" className={`topbar-button ${
                            isOnRegisterPage 
                                ? 'topbar-button-register-active' 
                                : 'topbar-button-register'
                        }`}>
                            Đăng ký
                        </Link>
                    </div>
                </>
            );
        }
    } else {
        // Logged in states
        if (pageType === 'in-chat') {
            headerContent = (
                <>
                    <div className="topbar-left">
                        {renderLogo()}
                    </div>
                    <div className="topbar-center">
                        {/* Future: Session title will go here */}
                        <h1 className="topbar-session-title">
                            {/* Session title placeholder */}
                            Chat Session
                        </h1>
                    </div>
                    <div className="topbar-right">
                        <button className="topbar-button topbar-button-share">
                            {/* Share Icon placeholder */}
                            <div className="topbar-icon"></div>
                            Chia sẻ
                        </button>
                        {/* More options button placeholder */}
                        <button className="topbar-icon-button">
                            <div className="topbar-icon"></div>
                        </button>
                        {/* Avatar */}
                        <img 
                            src={user?.avatar || defaultAvatar} 
                            alt="User Avatar" 
                            className="topbar-avatar" 
                            onClick={handleLogout} 
                        />
                    </div>
                </>
            );
        } else {
            // Default logged in state
            headerContent = (
                <>
                    <div className="topbar-left">
                        {renderLogo()}
                    </div>
                    <div className="topbar-right">
                        {/* Avatar */}
                        <img 
                            src={user?.avatar || defaultAvatar} 
                            alt="User Avatar" 
                            className="topbar-avatar" 
                            onClick={handleLogout} 
                        />
                    </div>
                </>
            );
        }
    }

    return (
        <nav className={getTopBarClasses()}>
            {headerContent}
        </nav>
    );
};

export default Header;