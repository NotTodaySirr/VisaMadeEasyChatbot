import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GuestLayout from '../../../layout/guest';
import AuthForm from '../../../components/auth/AuthForm/AuthForm';

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (formData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Future: Implement actual login API call
      console.log('Login attempt with:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Future: Handle successful login
      // - Store JWT token
      // - Update user context
      // - Navigate to dashboard/home
      console.log('Login successful');
      
    } catch (err) {
      setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GuestLayout pageType="started">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '60px 16px 24px 16px', // Added more top padding to move form up
        minHeight: 'calc(100vh - 120px)', // Account for header height
        overflow: 'hidden'
      }}>
        {/* Welcome Message */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 'bold',
            fontSize: '32px',
            color: '#0F172B',
            textAlign: 'center',
            margin: 0
          }}>
            Chào mừng trở lại
          </h1>
        </div>

        {/* Login Form */}
        <AuthForm
          mode="login"
          onSubmit={handleLogin}
          loading={loading}
          error={error}
        />
      </div>
    </GuestLayout>
  );
};

export default LoginPage;