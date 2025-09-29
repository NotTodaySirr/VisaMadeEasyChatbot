import React, { useState, useEffect } from 'react';
import userService from '../../../services/userService.js';
import { getUserFromToken, isUserAuthenticated } from '../../../lib/utils.ts';
import './ProfileCard.css';

const ProfileCard = ({ isOpen, onClose, user: initialUser }) => {
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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

          <div className="profile-field">
            <label className="profile-field-label">Thay đổi mật khẩu</label>
            <button className="profile-btn profile-btn-secondary">
              Đổi mật khẩu
            </button>
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
