import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GuestLayout from '../../../layout/guest';
import AuthForm from '../../../components/auth/AuthForm/AuthForm';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRegister = async (formData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Future: Implement actual register API call
      console.log('Register attempt with:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Future: Handle successful registration
      // - Create user account
      // - Send verification email
      // - Show success message
      // - Navigate to login or dashboard
      console.log('Registration successful');
      
    } catch (err) {
      setError('Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
      console.error('Registration error:', err);
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
        padding: '60px 16px 16px 16px', // Added more top padding to move form up
        minHeight: 'calc(100vh - 120px)', // Account for header height
        overflow: 'auto'
      }}>
        {/* Welcome Message */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 'bold',
            fontSize: '28px',
            color: '#0F172B',
            textAlign: 'center',
            margin: 0
          }}>
            Tạo tài khoản
          </h1>
        </div>

        {/* Register Form */}
        <AuthForm
          mode="register"
          onSubmit={handleRegister}
          loading={loading}
          error={error}
        />
      </div>
    </GuestLayout>
  );
};

export default RegisterPage;