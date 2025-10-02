import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import '../AuthForm/AuthForm.css';

const NewPasswordForm = ({ onSubmit, loading = false, error = null, onBack }) => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Frontend validation
    if (formData.password !== formData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 8) {
      alert('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }

    if (onSubmit) {
      onSubmit(formData);
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

        {/* Section Header */}
        <div className="auth-form-section-header">
          <h3 className="auth-form-section-title">Đặt mật khẩu mới</h3>
        </div>

        {/* Password Field */}
        <div className="auth-form-field">
          <label className="auth-form-label">
            Mật khẩu mới
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
              onClick={() => setShowPassword(!showPassword)}
              className="auth-form-password-toggle"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Confirm Password Field */}
        <div className="auth-form-field">
          <label className="auth-form-label">
            Xác nhận mật khẩu
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
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="auth-form-password-toggle"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="auth-form-button-group">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="auth-form-back-button"
            >
              Quay lại
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !formData.password || !formData.confirmPassword}
            className="auth-form-submit"
          >
            {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewPasswordForm;
