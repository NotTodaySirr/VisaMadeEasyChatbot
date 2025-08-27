import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { setNavigationCallback } from './services/api/apiClient.js';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import LandingPage from './pages/LandingPage/LandingPage';
import LoginPage from './pages/auth/LoginPage/LoginPage';
import RegisterPage from './pages/auth/RegisterPage/RegisterPage';
import GuestChatPage from './pages/chat/GuestChatPage/GuestChatPage';
import MainChatPage from './pages/chat/MainChatPage/MainChatPage';
import './App.css';

// Router wrapper component to set up navigation callback
const RouterContent = () => {
  const navigate = useNavigate();

  // Set up navigation callback for API client
  useEffect(() => {
    setNavigationCallback(navigate);
  }, [navigate]);

  return (
    <div className="min-h-screen">
      <Routes>
        {/* Landing Page */}
        <Route path="/landing" element={<LandingPage />} />
        
        {/* Public Chat Routes */}
        <Route path="/chat/guest" element={<GuestChatPage />} />
        
        {/* Authentication Routes */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        {/* <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} /> */}
        
        {/* Protected Routes */}
        <Route path="/chat" element={
          <ProtectedRoute>
            <MainChatPage />
          </ProtectedRoute>
        } />
        
        {/* Future protected routes */}
        {/* <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } /> */}
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/landing" replace />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <RouterContent />
    </AuthProvider>
  );
}

export default App
