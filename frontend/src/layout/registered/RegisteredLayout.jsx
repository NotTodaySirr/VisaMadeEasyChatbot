import React from 'react';
import Header from '../../components/Header/Header';
import './RegisteredLayout.css';

const RegisteredLayout = ({ children, pageType = 'default', user = null }) => {
    return (
        <div className="registered-layout">
            <Header isLoggedIn={true} pageType={pageType} user={user} />
            <main className="registered-main-container">
                {children}
            </main>
        </div>
    );
};

export default RegisteredLayout;