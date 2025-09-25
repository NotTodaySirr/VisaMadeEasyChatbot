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
        <div className="w-full h-full flex-1 flex justify-center items-center">
          {/* Main Container - matches Frame 107 from your CSS */}
          <div className="flex flex-col items-center gap-10 w-[356px] h-[521px]">
            {/* Heading - separate from form */}
            <h1 className="w-[261px] h-9 text-center font-bold text-[30px] leading-9 text-[#0F172B]">
              Đăng nhập
            </h1>

            {/* Login Form */}
            <AuthForm
              mode="login"
              onSubmit={handleLogin}
              loading={loginLoading}
              error={error || authError}
            />
          </div>
        </div>
    </GuestLayout>
  );
};

export default LoginPage;