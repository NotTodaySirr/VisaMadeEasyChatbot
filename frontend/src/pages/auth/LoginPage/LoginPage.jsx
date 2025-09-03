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
        <div className="w-full max-w-md flex flex-col items-center">
        {/* Welcome Message */}
        <div className="mb-8">
        <h1 className="font-bold text-3xl text-center text-[#0F172B]">
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