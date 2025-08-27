import React from 'react';
import RegisteredLayout from '../../../layout/registered';
import { useAuth } from '../../../hooks/auth/useAuth.js';

const MainChatPage = () => {
  const { user, logout } = useAuth();

  return (
    <RegisteredLayout>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 16px',
        minHeight: 'calc(100vh - 120px)',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 'bold',
          fontSize: '32px',
          color: '#0F172B',
          marginBottom: '16px'
        }}>
          Welcome, {user?.username || 'User'}!
        </h1>
        
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '18px',
          color: '#64748b',
          marginBottom: '32px',
          maxWidth: '600px'
        }}>
          This is your personalized chat interface. Here you can access all premium features,
          save your chat history, and get personalized visa assistance.
        </p>

        <div style={{
          padding: '20px',
          backgroundColor: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '8px',
          maxWidth: '500px',
          marginBottom: '32px'
        }}>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '16px',
            color: '#0369a1',
            margin: '0'
          }}>
            🎉 Full chatbot interface with premium features will be implemented here
          </p>
        </div>

        <div style={{
          padding: '16px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          marginBottom: '32px'
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#374151' }}>User Info:</h3>
          <p style={{ margin: '4px 0', color: '#6b7280' }}>Email: {user?.email}</p>
          <p style={{ margin: '4px 0', color: '#6b7280' }}>Username: {user?.username}</p>
          <p style={{ margin: '4px 0', color: '#6b7280' }}>Education: {user?.educational_level}</p>
        </div>

        <button
          onClick={() => logout()}
          style={{
            padding: '12px 24px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    </RegisteredLayout>
  );
};

export default MainChatPage;