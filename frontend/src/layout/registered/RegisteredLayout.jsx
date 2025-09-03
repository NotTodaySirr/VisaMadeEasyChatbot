import React from 'react';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/sidebar/Sidebar';
import './RegisteredLayout.css';

const RegisteredLayout = ({ children, pageType = 'default', user = null }) => {
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