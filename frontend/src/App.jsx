import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';
import LoginPage from './pages/auth/LoginPage/LoginPage';
import RegisterPage from './pages/auth/RegisterPage/RegisterPage';
import './App.css';

function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Authentication Routes */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        {/* <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} /> */}
        
        {/* Future main app routes */}
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        {/* <Route path="/chat" element={<ChatPage />} /> */}
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
