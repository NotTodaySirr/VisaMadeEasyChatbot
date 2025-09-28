import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { setNavigationCallback } from '../services/api/apiClient.js';
import ProtectedRoute from './ProtectedRoute.jsx';
import LandingPage from '../pages/LandingPage/LandingPage';
import LoginPage from '../pages/auth/LoginPage/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage/RegisterPage';
import GuestChatPage from '../pages/chat/GuestChatPage/GuestChatPage';
import MainChatPage from '../pages/chat/MainChatPage/MainChatPage';
import TestPage from '../pages/TestPage/TestPage';
import ViewDocuments from '../pages/documents/ViewDocuments.jsx';
import RegisteredChatPage from '../pages/chat/RegisteredChatPage/RegisteredChatPage';
import ChecklistPage from '../pages/checklist/ChecklistPage/ChecklistPage.jsx';

const AppRoutes = () => {
  const navigate = useNavigate();

  // Set up navigation callback for API client
  useEffect(() => {
    setNavigationCallback(navigate);
  }, [navigate]);

  return (
    <div className="w-full h-full">
      <Routes>
        {/* Landing Page */}
        <Route path="/landing" element={<LandingPage />} />
        
        {/* Public Chat Routes */}
        <Route path="/chat/guest" element={<GuestChatPage />} />
        
        {/* Test Route - Remove in production */}
        <Route path="/test" element={<TestPage />} />
        
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
        <Route path="/chat/in" element={
          <ProtectedRoute>
            <RegisteredChatPage />
          </ProtectedRoute>
        } />
        <Route path="/chat/in/:id" element={
          <ProtectedRoute>
            <RegisteredChatPage />
          </ProtectedRoute>
        } />
        {/* Checklist Route */}
        <Route path="/checklist/:id" element={
          <ProtectedRoute>
            <ChecklistPage />
          </ProtectedRoute>
        } />
        {/* Documents Route */}
        <Route path="/documents/all" element={
          <ProtectedRoute>
            <ViewDocuments />
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

export default AppRoutes;