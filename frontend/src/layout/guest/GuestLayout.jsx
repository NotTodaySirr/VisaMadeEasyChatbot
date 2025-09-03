import React from 'react';
import Header from '../../components/Header/Header';
import './GuestLayout.css';

const GuestLayout = ({ children, pageType = 'default' }) => {
    return (
        <div className="guest-layout flex flex-col">
            <Header isLoggedIn={false} pageType={pageType} />
            <main className="guest-main-container">
                {children}
            </main>
        </div>
    );
};

export default GuestLayout;