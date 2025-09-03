import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/auth/useAuth.js';

/**
 * ProtectedRoute component that requires authentication
 * Redirects to login page if user is not authenticated
 */
const ProtectedRoute = ({ children, requireAuth = true, redirectTo = '/auth/login' }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Save the current location for redirect after login
    const returnUrl = location.pathname + location.search;
    const loginPath = `${redirectTo}?returnUrl=${encodeURIComponent(returnUrl)}`;
    return <Navigate to={loginPath} replace />;
  }

  // If user is authenticated or authentication is not required
  return children;
};

/**
 * PublicRoute component for routes that should only be accessible to non-authenticated users
 * Redirects authenticated users to a specified route
 */
export const PublicRoute = ({ children, redirectTo = '/chat' }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is authenticated, redirect them
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // If user is not authenticated, show the route
  return children;
};

export default ProtectedRoute;