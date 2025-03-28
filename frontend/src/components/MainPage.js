import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../api';

const MainPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container">
      <h1>Trang chính</h1>
      <p>Bạn đã đăng nhập thành công!</p>
      <button 
        className="logout-button" 
        onClick={handleLogout}
        disabled={loading}
      >
        {loading ? 'Đang đăng xuất...' : 'Đăng xuất'}
      </button>
    </div>
  );
};

export default MainPage;