import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GuestLayout from '../../../layout/guest';
import AuthForm from '../../../components/auth/AuthForm/AuthForm';
import { useAuth } from '../../../hooks/auth/useAuth.js';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, registerLoading, error: authError, clearError } = useAuth();
  const [error, setError] = useState(null);

  const handleRegister = async (formData) => {
    // Clear any previous errors
    setError(null);
    clearError();
    
    try {
      // Map the form data to match backend expectations
      const registrationData = {
        email: formData.email,
        username: formData.name, // Map 'name' to 'username' for backend
        password: formData.password,
        yearofbirth: parseInt(formData.birthYear), // Convert to number
        educational_level: mapEducationLevel(formData.educationLevel)
      };
      
      console.log('Registration attempt with:', registrationData);
      
      const result = await register(registrationData);
      
      if (!result.success) {
        setError(result.message);
      }
      // Navigation is handled by the useAuth hook on success
      
    } catch (err) {
      setError('Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
      console.error('Registration error:', err);
    }
  };

  // Map frontend education levels to backend expected values
  const mapEducationLevel = (level) => {
    const educationMap = {
      'secondary': 'High School',
      'high_school': 'High School', 
      'college': 'Associate Degree',
      'university': "Bachelor's Degree",
      'master': "Master's Degree",
      'phd': 'Doctorate'
    };
    return educationMap[level] || 'Other';
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
          loading={registerLoading}
          error={error || authError}
        />
      </div>
    </GuestLayout>
  );
};

export default RegisterPage;