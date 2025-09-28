import React, { useState } from 'react';
import './ProfileCard.css';

const ProfileCard = ({ isOpen, onClose, user }) => {
  // Mock data - replace with actual user data later
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    birthYear: '2000',
    education: 'Cử nhân',
    email: 'john.doe@example.com'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...profileData });

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ ...profileData });
  };

  const handleSave = () => {
    setProfileData({ ...editData });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({ ...profileData });
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

        <div className="profile-section">
          <h2 className="profile-section-title">Thông tin cá nhân</h2>

          <div className="profile-field">
            <label className="profile-field-label">Tên</label>
            {isEditing ? (
              <input
                type="text"
                value={editData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="profile-field-input"
              />
            ) : (
              <span className="profile-field-value">{profileData.name}</span>
            )}
          </div>

          <div className="profile-field">
            <label className="profile-field-label">Năm sinh</label>
            {isEditing ? (
              <input
                type="text"
                value={editData.birthYear}
                onChange={(e) => handleInputChange('birthYear', e.target.value)}
                className="profile-field-input"
              />
            ) : (
              <span className="profile-field-value">{profileData.birthYear}</span>
            )}
          </div>

          <div className="profile-field">
            <label className="profile-field-label">Trình độ học vấn</label>
            {isEditing ? (
              <input
                type="text"
                value={editData.education}
                onChange={(e) => handleInputChange('education', e.target.value)}
                className="profile-field-input"
              />
            ) : (
              <span className="profile-field-value">{profileData.education}</span>
            )}
          </div>

          <div className="profile-section-actions">
            {isEditing ? (
              <>
                <button className="profile-btn profile-btn-cancel" onClick={handleCancel}>
                  Hủy
                </button>
                <button className="profile-btn profile-btn-save" onClick={handleSave}>
                  Lưu
                </button>
              </>
            ) : (
              <button className="profile-btn profile-btn-edit" onClick={handleEdit}>
                Chỉnh sửa
              </button>
            )}
          </div>
        </div>

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
