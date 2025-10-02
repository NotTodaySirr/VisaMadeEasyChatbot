import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AuthForm.css';

const AuthForm = ({ 
  mode = 'login', 
  onSubmit, 
  loading = false, 
  error = null 
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    birthYear: '',
    educationLevel: '',
    agreeToTerms: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerStep, setRegisterStep] = useState(1); // For multi-step registration

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      // Only send relevant data based on mode
      let submitData;
      if (mode === 'login') {
        submitData = { email: formData.email, password: formData.password };
      } else if (mode === 'register') {
        // Validate passwords match for registration
        if (formData.password !== formData.confirmPassword) {
          alert('Mật khẩu không khớp');
          return;
        }
        submitData = {
          name: formData.name,
          birthYear: formData.birthYear,
          educationLevel: formData.educationLevel,
          email: formData.email,
          password: formData.password,
          agreeToTerms: formData.agreeToTerms
        };
      } else {
        submitData = formData;
      }
      onSubmit(submitData);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Login form configuration
  const renderLoginForm = () => (
    <>
      {/* Email Field */}
      <div className="auth-form-field">
        <label className="auth-form-label">
        Email
        </label>
        <div className="auth-form-input-wrapper">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="username@email.com"
            className="auth-form-input"
            required
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="auth-form-field">
        <label className="auth-form-label">
          Mật khẩu
        </label>
        <div className="auth-form-input-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="************"
            className="auth-form-input auth-form-input-password"
            autoComplete="current-password"
            data-lpignore="true"
            data-form-type="password"
            style={{ 
              WebkitAppearance: 'none',
              MozAppearance: 'textfield'
            }}
            required
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="auth-form-password-toggle"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="auth-form-submit"
      >
        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>

      {/* Footer Links */}
      <div className="auth-form-footer">
        {/* Register Link */}
        <div className="auth-form-link-row">
          <span className="auth-form-text">Chưa có tài khoản?</span>
          <button
            type="button"
            className="auth-form-link-button"
            onClick={() => navigate('/auth/register')}
          >
            Đăng ký
          </button>
        </div>

        {/* Forgot Password Link */}
        <div className="auth-form-link-single">
          <button
            type="button"
            className="auth-form-link-button"
            onClick={() => navigate('/auth/forgot-password')}
          >
            Quên mật khẩu?
          </button>
        </div>

        {/* Guest Access Link */}
        <div className="auth-form-link-single">
          <button
            type="button"
            className="auth-form-link-button"
            onClick={() => {
              navigate('/chat/guest');
            }}
          >
            Tiếp tục với vai trò khách
          </button>
        </div>
      </div>
    </>
  );

  // Register form configuration - Step 1: Personal Information
  const renderRegisterStep1 = () => (
    <>
      {/* Section Header */}
      <div className="auth-form-section-header">
        <h3 className="auth-form-section-title">Thông tin cá nhân</h3>
      </div>

      {/* Name Field */}
      <div className="auth-form-field">
        <label className="auth-form-label">
          Tên
        </label>
        <div className="auth-form-input-wrapper">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Nhập thông tin"
            className="auth-form-input"
            required
          />
        </div>
      </div>

      {/* Birth Year Field */}
      <div className="auth-form-field">
        <label className="auth-form-label">
          Năm sinh
        </label>
        <div className="auth-form-input-wrapper">
          <input
            type="number"
            name="birthYear"
            value={formData.birthYear}
            onChange={handleInputChange}
            placeholder="Nhập thông tin"
            className="auth-form-input"
            min="1900"
            max={new Date().getFullYear()}
            required
          />
        </div>
      </div>

      {/* Education Level Field */}
      <div className="auth-form-field">
        <label className="auth-form-label">
          Trình độ học vấn
        </label>
        <div className="auth-form-input-wrapper">
          <select
            name="educationLevel"
            value={formData.educationLevel}
            onChange={handleInputChange}
            className="auth-form-input auth-form-select"
            required
          >
            <option value="">Chọn trình độ học vấn</option>
            <option value="secondary">Trung học cơ sở</option>
            <option value="high_school">Trung học phổ thông</option>
            <option value="college">Cao đẳng</option>
            <option value="university">Đại học</option>
            <option value="master">Thạc sĩ</option>
            <option value="phd">Tiến sĩ</option>
          </select>
        </div>
      </div>

      {/* Continue Button */}
      <button
        type="button"
        onClick={() => setRegisterStep(2)}
        className="auth-form-submit"
        disabled={!formData.name || !formData.birthYear || !formData.educationLevel}
      >
        Tiếp tục
      </button>
    </>
  );

  // Register form configuration - Step 2: Login Information
  const renderRegisterStep2 = () => (
    <>
      {/* Section Header */}
      <div className="auth-form-section-header">
        <h3 className="auth-form-section-title">Thông tin đăng nhập</h3>
      </div>

      {/* Email Field */}
      <div className="auth-form-field">
        <label className="auth-form-label">
          Email
        </label>
        <div className="auth-form-input-wrapper">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="username@email.com"
            className="auth-form-input"
            required
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="auth-form-field">
        <label className="auth-form-label">
          Mật khẩu
        </label>
        <div className="auth-form-input-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="************"
            className="auth-form-input auth-form-input-password"
            autoComplete="new-password"
            data-lpignore="true"
            data-form-type="password"
            style={{ 
              WebkitAppearance: 'none',
              MozAppearance: 'textfield'
            }}
            required
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="auth-form-password-toggle"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      {/* Confirm Password Field */}
      <div className="auth-form-field">
        <label className="auth-form-label">
          Nhập lại mật khẩu
        </label>
        <div className="auth-form-input-wrapper">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="************"
            className="auth-form-input auth-form-input-password"
            autoComplete="new-password"
            data-lpignore="true"
            data-form-type="password"
            style={{ 
              WebkitAppearance: 'none',
              MozAppearance: 'textfield'
            }}
            required
          />
          <button
            type="button"
            onClick={toggleConfirmPasswordVisibility}
            className="auth-form-password-toggle"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      {/* Terms Agreement Checkbox */}
      <div className="auth-form-checkbox-field">
        <div className="auth-form-checkbox-wrapper">
          <input
            type="checkbox"
            id="agreeToTerms"
            name="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={handleInputChange}
            className="auth-form-checkbox"
            required
          />
          <label htmlFor="agreeToTerms" className="auth-form-checkbox-label">
            Tôi đồng ý Điều khoản dịch vụ
          </label>
        </div>
        <div className="auth-form-checkbox-description">
          <button
            type="button"
            className="auth-form-link-button"
            onClick={() => {
              // Future: Open terms of service modal/page
              console.log('Open terms of service');
            }}
          >
            Đọc Điều khoản dịch vụ
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="auth-form-button-group">
        <button
          type="button"
          onClick={() => setRegisterStep(1)}
          className="auth-form-back-button"
        >
          Quay lại
        </button>
        <button
          type="submit"
          disabled={loading || !formData.email || !formData.password || !formData.confirmPassword || !formData.agreeToTerms}
          className="auth-form-submit"
        >
          {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
        </button>
      </div>

      {/* Link back to Login */}
      <div className="auth-form-footer">
        <div className="auth-form-link-row">
          <span className="auth-form-text">Đã có tài khoản?</span>
          <button
            type="button"
            className="auth-form-link-button"
            onClick={() => navigate('/auth/login')}
          >
            Đăng nhập
          </button>
        </div>
      </div>
    </>
  );

  // Main register form renderer
  const renderRegisterForm = () => {
    if (registerStep === 1) {
      return renderRegisterStep1();
    } else {
      return renderRegisterStep2();
    }
  };

  // Future: Forgot password form configuration
  const renderForgotPasswordForm = () => (
    <div className="auth-form-placeholder">
      Forgot password form will be implemented here
    </div>
  );

  const renderFormContent = () => {
    switch (mode) {
      case 'login':
        return renderLoginForm();
      case 'register':
        return renderRegisterForm();
      case 'forgot-password':
        return renderForgotPasswordForm();
      default:
        return renderLoginForm();
    }
  };

  return (
    <div className="auth-form-container">
      <form onSubmit={handleSubmit} className="auth-form">
        {/* Error Message */}
        {error && (
          <div className="auth-form-error">
            <p>{error}</p>
          </div>
        )}

        {/* Form Content */}
        {renderFormContent()}
      </form>
    </div>
  );
};

export default AuthForm;
