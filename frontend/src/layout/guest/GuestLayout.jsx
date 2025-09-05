import React from 'react';
import Header from '../../components/Header/Header';
import './GuestLayout.css';

const GuestLayout = ({ children, pageType = 'default', inputField, scrollRef = null }) => {
    if (pageType === 'in-chat') {
        return (
            <div className="guest-layout h-screen" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Header at top (auto height) */}
                <Header isLoggedIn={false} pageType={pageType} />

                {/* Middle: scrollable area between header and input */}
                <main style={{ flex: 1, minHeight: 0, overflowY: 'auto' }} ref={scrollRef}>
                    {children}
                </main>

                {/* Footer/input at bottom (auto height) */}
                {inputField && (
                    <div className="bg-white border-t flex justify-center" style={{ flexShrink: 0, transform: 'translateY(calc(-1 * var(--input-lift)))' }}>
                        {inputField}
                    </div>
                )}
            </div>
        );
    }

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