import React, { useState, useEffect } from 'react';
import userService from '../../../services/userService.js';
import authService from '../../../services/auth/authService.js';
import { getUserFromToken, isUserAuthenticated } from '../../../lib/utils.ts';
import './ProfileCard.css';

const ProfileCard = ({ isOpen, onClose, user: initialUser }) => {
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Password reset states
  const [passwordResetState, setPasswordResetState] = useState('idle'); // 'idle' | 'editing' | 'loading' | 'success' | 'error'
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0); // 0-4 strength levels

  // Load user data when component opens or initialUser changes
  useEffect(() => {
    if (isOpen && initialUser) {
      // If user data is provided as prop, use it
      const mappedUser = {
        name: initialUser.username,
        birthYear: initialUser.yearofbirth?.toString(),
        education: initialUser.educational_level,
        email: initialUser.email
      };
      setProfileData(mappedUser);
      setEditData(mappedUser);
    } else if (isOpen) {
      // Otherwise get from localStorage
      loadUserProfile();
    }
  }, [isOpen, initialUser]);

  const loadUserProfile = () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if user is authenticated first
      if (!isUserAuthenticated()) {
        setError('Người dùng chưa đăng nhập');
        setIsLoading(false);
        return;
      }

      // Get user data from localStorage
      const userData = getUserFromToken();

      if (userData) {
        const mappedUser = {
          name: userData.username,
          birthYear: userData.yearofbirth?.toString(),
          education: userData.educational_level,
          email: userData.email
        };
        setProfileData(mappedUser);
        setEditData(mappedUser);
      } else {
        setError('Không tìm thấy thông tin người dùng');
      }
    } catch (err) {
      setError('Không thể tải thông tin người dùng');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ ...profileData });
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Map frontend field names back to backend field names
      const updateData = {};
      if (editData.name !== profileData.name) {
        updateData.username = editData.name;
      }
      if (editData.birthYear !== profileData.birthYear) {
        updateData.yearofbirth = parseInt(editData.birthYear);
      }
      if (editData.education !== profileData.education) {
        updateData.educational_level = editData.education;
      }

      const result = await userService.updateUserProfile(updateData);

      if (result.success) {
        // Update local state with server response
        const updatedUser = {
          name: result.data.user.username,
          birthYear: result.data.user.yearofbirth?.toString(),
          education: result.data.user.educational_level,
          email: result.data.user.email
        };
        setProfileData(updatedUser);
        setIsEditing(false);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Không thể cập nhật thông tin');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({ ...profileData });
    setError(null);
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Password strength validation
  const validatePasswordStrength = (password) => {
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    strength = Object.values(checks).filter(Boolean).length;

    // Bonus for longer passwords
    if (password.length >= 12) strength += 0.5;

    return Math.min(strength, 4);
  };

  // Password form handlers
  const handlePasswordInputChange = (field, value) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));

    // Real-time validation
    if (field === 'newPassword') {
      const strength = validatePasswordStrength(value);
      setPasswordStrength(strength);

      // Clear errors when user starts typing
      if (passwordErrors.newPassword) {
        setPasswordErrors(prev => ({ ...prev, newPassword: null }));
      }
    }

    // Check if passwords match when confirm password changes
    if (field === 'confirmPassword' || (field === 'newPassword' && passwordForm.confirmPassword)) {
      const newPassword = field === 'newPassword' ? value : passwordForm.newPassword;
      const confirmPassword = field === 'confirmPassword' ? value : passwordForm.confirmPassword;

      if (newPassword && confirmPassword && newPassword !== confirmPassword) {
        setPasswordErrors(prev => ({ ...prev, confirmPassword: 'Mật khẩu xác nhận không khớp' }));
      } else {
        setPasswordErrors(prev => ({ ...prev, confirmPassword: null }));
      }
    }
  };

  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (passwordStrength < 2) {
      errors.newPassword = 'Mật khẩu quá yếu';
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      errors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordResetStart = () => {
    setPasswordResetState('editing');
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordErrors({});
    setPasswordStrength(0);
  };

  const handlePasswordResetCancel = () => {
    setPasswordResetState('idle');
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordVisibility({
      currentPassword: false,
      newPassword: false,
      confirmPassword: false
    });
    setPasswordErrors({});
    setPasswordStrength(0);
  };

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handlePasswordResetSubmit = async () => {
    if (!validatePasswordForm()) {
      return;
    }

    setPasswordResetState('loading');

    try {
      // Call the actual password change API
      const result = await authService.changePassword({
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword
      });

      if (result.success) {
        setPasswordResetState('success');

        // Reset form after 2 seconds
        setTimeout(() => {
          handlePasswordResetCancel();
        }, 2000);
      } else {
        setPasswordResetState('error');
        setPasswordErrors({
          general: result.message || 'Không thể thay đổi mật khẩu. Vui lòng thử lại.'
        });
      }
    } catch (error) {
      setPasswordResetState('error');
      setPasswordErrors({
        general: 'Không thể thay đổi mật khẩu. Vui lòng thử lại.'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="profile-modal-header">
          <h1 className="profile-modal-title">Tài khoản</h1>
          <button className="profile-modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="#0f172b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {isLoading && (
          <div className="profile-loading">
            <p>Đang tải thông tin...</p>
          </div>
        )}

        {error && (
          <div className="profile-error">
            <p>{error}</p>
            <button
              className="profile-btn profile-btn-secondary"
              onClick={loadUserProfile}
              disabled={isLoading}
            >
              Thử lại
            </button>
          </div>
        )}

        {profileData && !isLoading && (
          <>
            <div className="profile-section">
              <h2 className="profile-section-title">Thông tin cá nhân</h2>

              <div className="profile-field">
                <label className="profile-field-label">Tên</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="profile-field-input"
                    disabled={isLoading}
                  />
                ) : (
                  <span className="profile-field-value">{profileData.name}</span>
                )}
              </div>

              <div className="profile-field">
                <label className="profile-field-label">Năm sinh</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editData.birthYear || ''}
                    onChange={(e) => handleInputChange('birthYear', e.target.value)}
                    className="profile-field-input"
                    min="1900"
                    max={new Date().getFullYear()}
                    disabled={isLoading}
                  />
                ) : (
                  <span className="profile-field-value">{profileData.birthYear}</span>
                )}
              </div>

              <div className="profile-field">
                <label className="profile-field-label">Trình độ học vấn</label>
                {isEditing ? (
                  <select
                    value={editData.education || ''}
                    onChange={(e) => handleInputChange('education', e.target.value)}
                    className="profile-field-input"
                    disabled={isLoading}
                  >
                    <option value="">Chọn trình độ</option>
                    <option value="High School">Trung học</option>
                    <option value="Associate Degree">Cao đẳng</option>
                    <option value="Bachelor's Degree">Cử nhân</option>
                    <option value="Master's Degree">Thạc sĩ</option>
                    <option value="Doctorate">Tiến sĩ</option>
                    <option value="Other">Khác</option>
                  </select>
                ) : (
                  <span className="profile-field-value">
                    {editData.education === 'High School' ? 'Trung học' :
                     editData.education === 'Associate Degree' ? 'Cao đẳng' :
                     editData.education === 'Bachelor\'s Degree' ? 'Cử nhân' :
                     editData.education === 'Master\'s Degree' ? 'Thạc sĩ' :
                     editData.education === 'Doctorate' ? 'Tiến sĩ' :
                     editData.education === 'Other' ? 'Khác' :
                     profileData.education}
                  </span>
                )}
              </div>

              <div className="profile-field">
                <label className="profile-field-label">Email</label>
                <span className="profile-field-value">{profileData.email}</span>
              </div>

              <div className="profile-section-actions">
                {isEditing ? (
                  <>
                    <button
                      className="profile-btn profile-btn-cancel"
                      onClick={handleCancel}
                      disabled={isLoading}
                    >
                      Hủy
                    </button>
                    <button
                      className="profile-btn profile-btn-save"
                      onClick={handleSave}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Đang lưu...' : 'Lưu'}
                    </button>
                  </>
                ) : (
                  <button
                    className="profile-btn profile-btn-edit"
                    onClick={handleEdit}
                    disabled={isLoading}
                  >
                    Chỉnh sửa
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        <div className="profile-section">
          <h2 className="profile-section-title">Bảo mật</h2>

          {/* Password Reset Section */}
          <div className="password-reset-section">
            <div className="password-reset-header">
              <label className="profile-field-label">Thay đổi mật khẩu</label>
              {passwordResetState === 'idle' && (
                <button
                  className="profile-btn profile-btn-secondary password-trigger-btn"
                  onClick={handlePasswordResetStart}
                >
                  Đổi mật khẩu
                </button>
              )}
            </div>

            {passwordResetState === 'editing' && (
              <div className="password-reset-form">
                <div className="password-input-group">
                  <label className="password-input-label">Mật khẩu hiện tại</label>
                  <div className="password-input-wrapper">
                    <input
                      type={passwordVisibility.currentPassword ? 'text' : 'password'}
                      placeholder="Nhập mật khẩu hiện tại"
                      value={passwordForm.currentPassword}
                      onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                      className={`password-input-field ${passwordErrors.currentPassword ? 'error' : ''}`}
                    />
                    <button
                      type="button"
                      className="password-visibility-toggle"
                      onClick={() => togglePasswordVisibility('currentPassword')}
                      tabIndex="-1"
                    >
                      {passwordVisibility.currentPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M2.99902 3L20.999 21M9.8433 9.91364C9.32066 10.4536 8.99902 11.1892 8.99902 12C8.99902 13.6569 10.3422 15 11.999 15C12.8215 15 13.5667 14.669 14.1086 14.133M6.49902 6.64715C4.59972 7.90034 3.15305 9.78394 2.45703 12C3.73128 16.0571 7.52159 19 11.9992 19C13.9881 19 15.8414 18.4194 17.3988 17.4184M10.999 5.04939C11.328 5.01673 11.6617 5 11.9992 5C16.4769 5 20.2672 7.94291 21.5414 12C21.2607 12.894 20.8577 13.7338 20.3522 14.5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="3"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <span className="error-message">{passwordErrors.currentPassword}</span>
                  )}
                </div>

                <div className="password-input-group">
                  <label className="password-input-label">Mật khẩu mới</label>
                  <div className="password-input-wrapper">
                    <input
                      type={passwordVisibility.newPassword ? 'text' : 'password'}
                      placeholder="Nhập mật khẩu mới"
                      value={passwordForm.newPassword}
                      onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                      className={`password-input-field ${passwordErrors.newPassword ? 'error' : ''}`}
                    />
                    <button
                      type="button"
                      className="password-visibility-toggle"
                      onClick={() => togglePasswordVisibility('newPassword')}
                      tabIndex="-1"
                    >
                      {passwordVisibility.newPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M2.99902 3L20.999 21M9.8433 9.91364C9.32066 10.4536 8.99902 11.1892 8.99902 12C8.99902 13.6569 10.3422 15 11.999 15C12.8215 15 13.5667 14.669 14.1086 14.133M6.49902 6.64715C4.59972 7.90034 3.15305 9.78394 2.45703 12C3.73128 16.0571 7.52159 19 11.9992 19C13.9881 19 15.8414 18.4194 17.3988 17.4184M10.999 5.04939C11.328 5.01673 11.6617 5 11.9992 5C16.4769 5 20.2672 7.94291 21.5414 12C21.2607 12.894 20.8577 13.7338 20.3522 14.5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="3"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {/* Password strength indicator */}
                  <div className="password-strength">
                    <div className="strength-bar">
                      {[1, 2, 3, 4].map(level => (
                        <div
                          key={level}
                          className={`strength-segment ${
                            level <= passwordStrength ? 'active' : ''
                          } ${
                            passwordStrength >= 1 && level <= passwordStrength ? 'filled' : ''
                          }`}
                        />
                      ))}
                    </div>
                    <span className="strength-text">
                      {passwordStrength === 0 && 'Rất yếu'}
                      {passwordStrength === 1 && 'Yếu'}
                      {passwordStrength === 2 && 'Trung bình'}
                      {passwordStrength === 3 && 'Mạnh'}
                      {passwordStrength >= 3.5 && 'Rất mạnh'}
                    </span>
                  </div>
                  {passwordErrors.newPassword && (
                    <span className="error-message">{passwordErrors.newPassword}</span>
                  )}
                </div>

                <div className="password-input-group">
                  <label className="password-input-label">Xác nhận mật khẩu mới</label>
                  <div className="password-input-wrapper">
                    <input
                      type={passwordVisibility.confirmPassword ? 'text' : 'password'}
                      placeholder="Nhập lại mật khẩu mới"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                      className={`password-input-field ${passwordErrors.confirmPassword ? 'error' : ''}`}
                    />
                    <button
                      type="button"
                      className="password-visibility-toggle"
                      onClick={() => togglePasswordVisibility('confirmPassword')}
                      tabIndex="-1"
                    >
                      {passwordVisibility.confirmPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M2.99902 3L20.999 21M9.8433 9.91364C9.32066 10.4536 8.99902 11.1892 8.99902 12C8.99902 13.6569 10.3422 15 11.999 15C12.8215 15 13.5667 14.669 14.1086 14.133M6.49902 6.64715C4.59972 7.90034 3.15305 9.78394 2.45703 12C3.73128 16.0571 7.52159 19 11.9992 19C13.9881 19 15.8414 18.4194 17.3988 17.4184M10.999 5.04939C11.328 5.01673 11.6617 5 11.9992 5C16.4769 5 20.2672 7.94291 21.5414 12C21.2607 12.894 20.8577 13.7338 20.3522 14.5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="3"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <span className="error-message">{passwordErrors.confirmPassword}</span>
                  )}
                </div>

                <div className="password-form-actions">
                  <button
                    className="profile-btn profile-btn-cancel"
                    onClick={handlePasswordResetCancel}
                  >
                    Hủy
                  </button>
                  <button
                    className="profile-btn profile-btn-save"
                    onClick={handlePasswordResetSubmit}
                    disabled={passwordResetState === 'loading'}
                  >
                    {passwordResetState === 'loading' ? 'Đang lưu...' : 'Lưu'}
                  </button>
                </div>
              </div>
            )}

            {passwordResetState === 'success' && (
              <div className="password-success">
                <span className="success-message">✅ Mật khẩu đã được thay đổi thành công!</span>
              </div>
            )}

            {passwordResetState === 'error' && (
              <div className="password-error">
                <span className="error-message">
                  {passwordErrors.general || 'Có lỗi xảy ra. Vui lòng thử lại.'}
                </span>
                <button
                  className="profile-btn profile-btn-secondary"
                  onClick={() => setPasswordResetState('editing')}
                >
                  Thử lại
                </button>
              </div>
            )}
          </div>

          <div className="profile-field">
            <label className="profile-field-label">Đăng xuất khỏi thiết bị này</label>
            <button className="profile-btn profile-btn-secondary">
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
