import { apiClient, TokenManager } from '../api/apiClient.js';
import API_ENDPOINTS from '../api/endpoints.js';

class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - Registration data
   * @param {string} userData.email - User email
   * @param {string} userData.username - Username
   * @param {string} userData.password - Password
   * @param {number} userData.yearofbirth - Year of birth
   * @param {string} userData.educational_level - Educational level
   */
  async register(userData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      
      const { data } = response.data;
      const { access_token, refresh_token, user } = data;
      
      // Store tokens and user data
      TokenManager.setTokens(access_token, refresh_token);
      TokenManager.setUserData(user);
      
      return {
        success: true,
        data: {
          user,
          access_token,
          refresh_token,
        },
        message: response.data.message,
      };
    } catch (error) {
      return this._handleError(error);
    }
  }

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - Email or username
   * @param {string} credentials.password - Password
   */
  async login(credentials) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      
      const { data } = response.data;
      const { access_token, refresh_token, user } = data;
      
      // Store tokens and user data
      TokenManager.setTokens(access_token, refresh_token);
      TokenManager.setUserData(user);
      
      return {
        success: true,
        data: {
          user,
          access_token,
          refresh_token,
        },
        message: response.data.message,
      };
    } catch (error) {
      return this._handleError(error);
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
      
      // Clear local storage
      TokenManager.clearTokens();
      
      return {
        success: true,
        message: 'Successfully logged out',
      };
    } catch (error) {
      // Even if API call fails, clear local tokens
      TokenManager.clearTokens();
      return {
        success: true,
        message: 'Logged out locally',
      };
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken() {
    try {
      const refreshToken = TokenManager.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH);
      
      const { data } = response.data;
      const { access_token, user } = data;
      
      // Update stored tokens and user data
      TokenManager.setTokens(access_token, refreshToken);
      TokenManager.setUserData(user);
      
      return {
        success: true,
        data: {
          access_token,
          user,
        },
        message: response.data.message,
      };
    } catch (error) {
      // Clear tokens if refresh fails
      TokenManager.clearTokens();
      return this._handleError(error);
    }
  }


  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const token = TokenManager.getAccessToken();
    const user = TokenManager.getUserData();
    return !!(token && user);
  }

  /**
   * Get current user from local storage
   */
  getCurrentUserLocal() {
    return TokenManager.getUserData();
  }

  /**
   * Change user password
   * @param {Object} passwordData - Password change data
   * @param {string} passwordData.current_password - Current password
   * @param {string} passwordData.new_password - New password
   */
  async changePassword(passwordData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, passwordData);

      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      return this._handleError(error);
    }
  }

  /**
   * Get access token from local storage
   */
  getAccessToken() {
    return TokenManager.getAccessToken();
  }

  /**
   * Handle API errors consistently
   * @private
   */
  _handleError(error) {
    let message = 'An unexpected error occurred';
    let errors = null;

    if (error.response) {
      // Server responded with error status
      const { data } = error.response;
      message = data?.message || message;
      errors = data?.errors || null;
    } else if (error.request) {
      // Network error
      message = 'Network error. Please check your connection.';
    } else {
      // Other error
      message = error.message || message;
    }

    return {
      success: false,
      message,
      errors,
      status: error.response?.status,
    };
  }
}

// Create singleton instance
const authService = new AuthService();
export default authService;