import React, { useState } from 'react';
import '../AuthForm/AuthForm.css';

const EmailValidationForm = ({ onSubmit, loading = false, error = null, onBack }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ email });
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
          <h3 className="auth-form-section-title">Khôi phục mật khẩu</h3>
        </div>

        {/* Email Field */}
        <div className="auth-form-field">
          <label className="auth-form-label">
            Email đăng ký
          </label>
          <div className="auth-form-input-wrapper">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="username@email.com"
              className="auth-form-input"
              required
            />
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
            disabled={loading || !email}
            className="auth-form-submit"
          >
            {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmailValidationForm;
