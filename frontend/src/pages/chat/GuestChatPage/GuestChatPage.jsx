import React from 'react';
import { useNavigate } from 'react-router-dom';
import GuestLayout from '../../../layout/guest';

const GuestChatPage = () => {
  const navigate = useNavigate();
  return (
    <GuestLayout pageType="default">
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
          Guest Chat
        </h1>
        
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '18px',
          color: '#64748b',
          marginBottom: '32px',
          maxWidth: '600px'
        }}>
          Welcome to the guest chat! This is a placeholder for the guest chatbot interface.
          Here users can try the chatbot without creating an account.
        </p>

        <div style={{
          padding: '20px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          maxWidth: '500px'
        }}>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '16px',
            color: '#475569',
            margin: '0'
          }}>
            🤖 Chatbot interface will be implemented here
          </p>
        </div>

        <div style={{
          marginTop: '32px',
          display: 'flex',
          gap: '16px'
        }}>
          <button
            onClick={() => navigate('/auth/register')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#1E46A4',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Create Account
          </button>
          
          <button
            onClick={() => navigate('/auth/login')}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              color: '#1E46A4',
              border: '1px solid #1E46A4',
              borderRadius: '6px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Login
          </button>
        </div>
      </div>
    </GuestLayout>
  );
};

export default GuestChatPage;