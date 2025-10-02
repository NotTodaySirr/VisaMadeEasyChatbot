import React, { useState } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import GuestLayout from '../../../layout/guest';
import EmailValidationForm from '../../../components/auth/ForgetPassword/EmailValidationForm';
import CheckEmailForm from '../../../components/auth/ForgetPassword/CheckEmailForm';
import NewPasswordForm from '../../../components/auth/ForgetPassword/NewPasswordForm';
import authService from '../../../services/auth/authService';

const PasswordResetPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { token: tokenParam } = useParams(); // Get token from URL path parameter
  const [currentStep, setCurrentStep] = useState(1); // 1: email, 2: check email, 3: new password
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if we have a token in URL for step 3 (check params first, then query string)
  React.useEffect(() => {
    const token = tokenParam || searchParams.get('token');
    if (token) {
      setCurrentStep(3);
    }
  }, [tokenParam, searchParams]);

  const handleEmailSubmit = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await authService.requestPasswordReset({ email: formData.email });

      if (result.success) {
        setEmail(formData.email);
        setCurrentStep(2);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Không thể gửi yêu cầu. Vui lòng thử lại.');
      console.error('Password reset request error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await authService.requestPasswordReset({ email });

      if (!result.success) {
        setError(result.message);
      }
    } catch (err) {
      setError('Không thể gửi lại email. Vui lòng thử lại.');
      console.error('Resend email error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewPasswordSubmit = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      // Get token from URL params first, then fall back to query string
      const token = tokenParam || searchParams.get('token');
      if (!token) {
        setError('Token không hợp lệ');
        return;
      }

      const result = await authService.completePasswordReset({
        token,
        password: formData.password,
        confirm_password: formData.confirmPassword
      });

      if (result.success) {
        // Success - redirect to login
        navigate('/auth/login');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Không thể cập nhật mật khẩu. Vui lòng thử lại.');
      console.error('Password reset completion error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      navigate('/auth/login');
    } else if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <EmailValidationForm
            onSubmit={handleEmailSubmit}
            loading={loading}
            error={error}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <CheckEmailForm
            email={email}
            onResend={handleResendEmail}
            onBack={handleBack}
            loading={loading}
          />
        );
      case 3:
        return (
          <NewPasswordForm
            onSubmit={handleNewPasswordSubmit}
            loading={loading}
            error={error}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <GuestLayout pageType="started">
      <div className="w-full h-full flex-1 flex justify-center items-center">
        <div className="flex flex-col items-center gap-10 w-[356px] h-[521px]">
          <h1 className="w-[261px] h-9 text-center font-bold text-[30px] leading-9 text-[#0F172B]">
            Khôi phục mật khẩu
          </h1>
          {renderCurrentStep()}
        </div>
      </div>
    </GuestLayout>
  );
};

export default PasswordResetPage;
