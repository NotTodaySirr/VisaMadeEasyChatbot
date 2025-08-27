import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext.jsx';
import authService from '../../services/auth/authService.js';

/**
 * Custom hook for authentication operations
 * Provides easy access to auth state and methods with additional utilities
 */
export const useAuth = () => {
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: contextLogin,
    register: contextRegister,
    logout: contextLogout,
    clearError,
    updateUser,
  } = useAuthContext();

  // Local loading states for specific operations
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  /**
   * Login with navigation
   */
  const login = useCallback(async (credentials, redirectTo = '/chat') => {
    setLoginLoading(true);
    
    try {
      const result = await contextLogin(credentials);
      
      if (result.success) {
        // Navigate to specified route on successful login
        navigate(redirectTo, { replace: true });
      }
      
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: 'Login failed. Please try again.' 
      };
    } finally {
      setLoginLoading(false);
    }
  }, [contextLogin, navigate]);

  /**
   * Register with navigation
   */
  const register = useCallback(async (userData, redirectTo = '/chat') => {
    setRegisterLoading(true);
    
    try {
      const result = await contextRegister(userData);
      
      if (result.success) {
        // Navigate to specified route on successful registration
        navigate(redirectTo, { replace: true });
      }
      
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: 'Registration failed. Please try again.' 
      };
    } finally {
      setRegisterLoading(false);
    }
  }, [contextRegister, navigate]);

  /**
   * Logout with navigation
   */
  const logout = useCallback(async (redirectTo = '/') => {
    setLogoutLoading(true);
    
    try {
      await contextLogout();
      // Navigate to specified route after logout
      navigate(redirectTo, { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLogoutLoading(false);
    }
  }, [contextLogout, navigate]);

  /**
   * Check if user has specific role or permission
   */
  const hasRole = useCallback((role) => {
    if (!isAuthenticated || !user) return false;
    // Implementation depends on your role system
    return user.roles?.includes(role) || false;
  }, [isAuthenticated, user]);

  /**
   * Get user profile information
   */
  const refreshUserProfile = useCallback(async () => {
    try {
      const result = await authService.getCurrentUser();
      if (result.success) {
        updateUser(result.data.user);
        return result;
      }
      return result;
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
      return { 
        success: false, 
        message: 'Failed to refresh profile' 
      };
    }
  }, [updateUser]);

  /**
   * Navigate to login page
   */
  const navigateToLogin = useCallback((returnUrl = null) => {
    const loginPath = returnUrl 
      ? `/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`
      : '/auth/login';
    navigate(loginPath, { replace: true });
  }, [navigate]);

  /**
   * Navigate to register page
   */
  const navigateToRegister = useCallback((returnUrl = null) => {
    const registerPath = returnUrl 
      ? `/auth/register?returnUrl=${encodeURIComponent(returnUrl)}`
      : '/auth/register';
    navigate(registerPath, { replace: true });
  }, [navigate]);

  /**
   * Check if currently loading any auth operation
   */
  const isAnyLoading = isLoading || loginLoading || registerLoading || logoutLoading;

  /**
   * Get current user's display name
   */
  const getDisplayName = useCallback(() => {
    if (!user) return null;
    return user.username || user.email || 'User';
  }, [user]);

  /**
   * Check if user is admin (placeholder for future role implementation)
   */
  const isAdmin = useCallback(() => {
    return hasRole('admin');
  }, [hasRole]);

  // Return all auth state and methods
  return {
    // Auth state
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Loading states
    isAnyLoading,
    loginLoading,
    registerLoading,
    logoutLoading,
    
    // Auth methods
    login,
    register,
    logout,
    clearError,
    
    // Utility methods
    hasRole,
    isAdmin,
    refreshUserProfile,
    getDisplayName,
    
    // Navigation methods
    navigateToLogin,
    navigateToRegister,
    
    // Direct service access (for advanced usage)
    authService,
  };
};

export default useAuth;