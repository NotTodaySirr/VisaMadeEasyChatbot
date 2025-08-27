import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GuestLayout from '../../../layout/guest';
import AuthForm from '../../../components/auth/AuthForm/AuthForm';
import { useAuth } from '../../../hooks/auth/useAuth.js';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loginLoading, error: authError, clearError } = useAuth();
  const [localError, setLocalError] = useState(null);

  // Determine which error to display (prioritize local error over auth error)
  const displayError = localError || authError;

  // Auto-clear error after 5 seconds
  useEffect(() => {
    if (displayError) {
      console.log('🔴 Error displayed:', displayError);
      
      const timer = setTimeout(() => {
        try {
          console.log('⏰ Auto-clearing error after 5 seconds');
          setLocalError(null);
          clearError();
        } catch (error) {
          console.error('💥 Error in timeout cleanup:', error);
          // Silently handle any errors in cleanup
        }
      }, 5000); // Show error for 5 seconds
      
      return () => {
        try {
          console.log('🧹 Cleanup timer');
          clearTimeout(timer);
        } catch (error) {
          console.error('💥 Error in timer cleanup:', error);
          // Silently handle any errors in cleanup
        }
      };
    }
  }, [displayError, clearError]);

  // Manual clear error function
  const handleClearError = () => {
    try {
      console.log('🧹 Manually clearing error');
      setLocalError(null);
      clearError();
    } catch (error) {
      console.error('💥 Error in manual error clearing:', error);
      // Silently handle any errors
    }
  };

  const handleLogin = async (formData) => {
    try {
      // Clear any previous errors immediately when starting new login
      console.log('🚀 Starting login...');
      setLocalError(null);
      clearError();
      
      console.log('📧 Login attempt for:', formData.email);
      
      const result = await login({
        email: formData.email,
        password: formData.password
      });
      
      console.log('📋 Login result:', result);
      
      // Only set local error if login was unsuccessful and no navigation happened
      if (!result.success) {
        console.log('❌ Setting error:', result.message);
        setLocalError(result.message);
      } else {
        console.log('✅ Login successful, should navigate now');
      }
      
    } catch (err) {
      console.error('💥 Login exception:', err);
      // Ensure we always show a user-friendly error message
      const errorMessage = 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      console.log('⚠️ Setting fallback error message:', errorMessage);
      setLocalError(errorMessage);
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
          error={displayError}
          onClearError={displayError ? handleClearError : null}
        />
      </div>
    </GuestLayout>
  );
};

export default LoginPage;