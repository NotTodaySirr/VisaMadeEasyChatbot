import React from 'react';
import { AuthProvider } from './context/AuthContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
import './App.css';



function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App
