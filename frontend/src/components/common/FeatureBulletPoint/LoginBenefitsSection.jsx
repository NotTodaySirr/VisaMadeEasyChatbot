import React from 'react';
import { Link } from 'react-router-dom';
import FeatureBulletPoint from '../FeatureBulletPoint/FeatureBulletPoint';
import './LoginBenefitsSection.css';
import unlockIcon from '../../../assets/ui/unlock.svg';

const LoginBenefitsSection = ({ 
  className = "",
  features = [],
  onLoginClick = null 
}) => {
  const defaultFeatures = [
    'Tạo hồ sơ để sắp xếp tài liệu và theo dõi tiến trình',
    'Lưu hội thoại với chatbot để dễ dàng xem lại sau',
    'Nhận nhắc nhở hạn nộp để không bỏ lỡ bước nào',
    'Đồng bộ hồ sơ và hội thoại để chatbot hỗ trợ tốt hơn'
  ];

  const featuresToShow = features.length > 0 ? features : defaultFeatures;

  const handleLoginClick = (e) => {
    if (onLoginClick) {
      e.preventDefault();
      onLoginClick();
    }
  };

  return (
    <div className={`login-benefits-section ${className}`}>
      {/* Header with icon and title */}
      <div className="login-benefits-header">
        <div className="login-benefits-icon">
          <img 
            src={unlockIcon}
            alt="Unlock"
            className="unlock-icon"
          />
        </div>
        <h2 className="login-benefits-title">
          Đăng nhập để mở ra cơ hội
        </h2>
      </div>

      {/* Feature bullet points */}
      <div className="login-benefits-features">
        {featuresToShow.map((feature, index) => (
          <FeatureBulletPoint
            key={index}
            text={feature}
          />
        ))}
      </div>

      {/* Login button */}
      <div className="login-benefits-action">
        <Link 
          to="/auth/login" 
          className="login-benefits-button"
          onClick={handleLoginClick}
        >
          Đăng nhập
        </Link>
      </div>
    </div>
  );
};

export default LoginBenefitsSection;