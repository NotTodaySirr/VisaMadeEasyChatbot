import React from 'react';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/sidebar/Sidebar';
import './RegisteredLayout.css';

const RegisteredLayout = ({ children, pageType = 'default', user = null, inputField = null, scrollRef = null }) => {
    if (pageType === 'in-chat') {
        return (
            <div className="registered-layout">
                <Sidebar />
                <div className="registered-content registered-inchat">
                    <Header isLoggedIn={true} pageType={pageType} user={user} />
                    <div className="registered-inchat-main">
                        <div className="registered-inchat-bg" ref={scrollRef}>
                            {children}
                        </div>
                    </div>
                    {inputField && (
                        <div className="registered-inchat-input">
                            {inputField}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="registered-layout">
            <Sidebar />
            <div className="registered-content">
                <Header isLoggedIn={true} pageType={pageType} user={user} />
                <main className="registered-main-container">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default RegisteredLayout;