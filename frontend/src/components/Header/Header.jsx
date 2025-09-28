import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Header.css';
import chatbotIcon from '../../assets/chatbot.svg';
import defaultAvatar from '/avatars/figma-avatar.svg';
import shareIcon from '../../assets/ui/share-icon.svg';
import moreVerticalIcon from '../../assets/ui/more-vertical.svg';
import pencilIcon from '../../assets/ui/pencil-icon.svg';
import trashIcon from '../../assets/ui/trash-icon.svg';
import ContextMenu from '../cards/ContextMenu/ContextMenu';
import authService from '../../services/auth/authService';

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

    const handleLogout = async () => {
        try {
            const result = await authService.logout();
            if (result.success) {
                // Successfully logged out, redirect to login
                navigate('/auth/login');
            } else {
                // Even if API call fails, clear local tokens and redirect
                console.warn('Logout API failed, clearing local tokens:', result.message);
                navigate('/auth/login');
            }
        } catch (error) {
            // Network error or other exception, still clear local tokens
            console.error('Logout error:', error);
            navigate('/auth/login');
        }
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
        <Link to={isLoggedIn ? "/chat" : "/"} className="topbar-logo">
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
                            <img src={shareIcon} alt="Share" className="topbar-icon" />
                            Chia sẻ
                        </button>
                        {/* More options button with context menu */}
                        <ContextMenu
                            trigger={
                                <button className="topbar-icon-button">
                                    <img src={moreVerticalIcon} alt="More options" className="topbar-icon" />
                                </button>
                            }
                            panelClassName="context-menu"
                        >
                            <div className="context-card-option" onClick={() => console.log('Export chat')}>
                                <img src={shareIcon} alt="Export" className="context-card-icon" />
                                <span className="context-card-text">Xuất chat</span>
                            </div>
                            <div className="context-card-option" onClick={() => console.log('Settings')}>
                                <img src={pencilIcon} alt="Settings" className="context-card-icon" />
                                <span className="context-card-text">Cài đặt</span>
                            </div>
                            <div className="context-card-option danger" onClick={handleLogout}>
                                <img src={trashIcon} alt="Logout" className="context-card-icon" />
                                <span className="context-card-text">Đăng xuất</span>
                            </div>
                        </ContextMenu>
                        {/* Avatar with logout context menu */}
                        <ContextMenu
                            trigger={
                                <img 
                                    src={user?.avatar || defaultAvatar} 
                                    alt="User Avatar" 
                                    className="topbar-avatar" 
                                />
                            }
                            panelClassName="context-menu"
                        >
                            <div className="context-card-option danger" onClick={handleLogout}>
                                <img src={trashIcon} alt="Logout" className="context-card-icon" />
                                <span className="context-card-text">Đăng xuất</span>
                            </div>
                        </ContextMenu>
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
                        {/* Avatar with logout context menu */}
                        <ContextMenu
                            trigger={
                                <img 
                                    src={user?.avatar || defaultAvatar} 
                                    alt="User Avatar" 
                                    className="topbar-avatar" 
                                />
                            }
                            panelClassName="context-menu"
                        >
                            <div className="context-card-option danger" onClick={handleLogout}>
                                <img src={trashIcon} alt="Logout" className="context-card-icon" />
                                <span className="context-card-text">Đăng xuất</span>
                            </div>
                        </ContextMenu>
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