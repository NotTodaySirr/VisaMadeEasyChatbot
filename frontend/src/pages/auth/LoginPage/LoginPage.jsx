import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GuestLayout from '../../../layout/guest';
import AuthForm from '../../../components/auth/AuthForm/AuthForm';
import { useAuth } from '../../../hooks/auth/useAuth.js';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loginLoading, error: authError, clearError } = useAuth();
  const [error, setError] = useState(null);

  const handleLogin = async (formData) => {
    // Clear any previous errors
    setError(null);
    clearError();
    
    try {
      const result = await login({
        email: formData.email,
        password: formData.password
      });
      
      if (!result.success) {
        setError(result.message);
      }
      // Navigation is handled by the useAuth hook on success
      
    } catch (err) {
      setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      console.error('Login error:', err);
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
          loading={loginLoading}
          error={error || authError}
        />
      </div>
    </GuestLayout>
  );
};

export default LoginPage;