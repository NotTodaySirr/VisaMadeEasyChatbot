import React from 'react';
import '../AuthForm/AuthForm.css';

// Custom styles for CheckEmailForm to make it taller
const checkEmailFormStyles = `
  .check-email-form-container {
    max-height: none !important;
    min-height: 500px !important;
    height: auto !important;
  }

  .check-email-form-content {
    padding: 40px 0 !important;
    gap: 24px !important;
  }

  .check-email-form-message {
    font-size: 18px !important;
    line-height: 1.6 !important;
    margin-bottom: 12px !important;
  }

  .check-email-form-email {
    font-size: 20px !important;
    margin-bottom: 32px !important;
    word-break: break-all !important;
  }

  .check-email-form-instructions {
    font-size: 16px !important;
    line-height: 1.5 !important;
    margin-bottom: 32px !important;
  }
`;

const CheckEmailForm = ({ email, onResend, onBack, loading = false }) => {
  return (
    <>
      <style>{checkEmailFormStyles}</style>
      <div className="auth-form-container check-email-form-container">
        <div className="auth-form check-email-form-content">
          {/* Section Header */}
          <div className="auth-form-section-header">
            <h3 className="auth-form-section-title">Kiểm tra email</h3>
          </div>

          {/* Email Icon and Message */}
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
            <p className="check-email-form-message">
              Chúng tôi đã gửi liên kết khôi phục mật khẩu đến
            </p>
            <p className="check-email-form-email">
              {email}
            </p>
            <p className="check-email-form-instructions">
              Vui lòng kiểm tra hộp thư đến và thư rác. Liên kết sẽ hết hạn sau 30 phút.
            </p>
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
              type="button"
              onClick={onResend}
              disabled={loading}
              className="auth-form-submit"
            >
              {loading ? 'Đang gửi...' : 'Gửi lại email'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckEmailForm;
