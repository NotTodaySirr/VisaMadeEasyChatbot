import React from 'react';
import { AuthProvider } from './context/AuthContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
import './App.css';
import { Toaster } from './components/ui/Toast';



function App() {
  return (
    <AuthProvider>
      <Toaster defaultPosition="top-center" />
      <AppRoutes />
    </AuthProvider>
  );
}

export default App
