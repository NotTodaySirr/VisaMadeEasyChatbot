import axios from 'axios';
import { notify } from '../notify.js';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Navigation callback for programmatic navigation
let navigationCallback = null;

// Function to set navigation callback
export const setNavigationCallback = (navigate) => {
  navigationCallback = navigate;
};

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Token management utilities
const TokenManager = {
  getAccessToken: () => localStorage.getItem('access_token'),
  getRefreshToken: () => localStorage.getItem('refresh_token'),
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
  },
  clearTokens: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
  getUserData: () => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  },
  setUserData: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  },
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = TokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => {
    try {
      const method = response.config?.method;
      if (['post', 'patch', 'delete'].includes(method)) {
        const msg = response.data?.message || 'Thao tác thành công!';
        notify(msg, 'success');
      }
    } catch {}
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh logic for validation-only requests
    if (originalRequest._validateOnly) {
      return Promise.reject(error);
    }

    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = TokenManager.getRefreshToken();
      if (refreshToken) {
        try {
          // Attempt token refresh
          const refreshResponse = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            {},
            {
              headers: {
                Authorization: `Bearer ${refreshToken}`,
              },
            }
          );

          const { access_token, user } = refreshResponse.data.data;
          
          // Update stored tokens and user data
          TokenManager.setTokens(access_token, refreshToken);
          TokenManager.setUserData(user);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to landing page
          TokenManager.clearTokens();
          if (navigationCallback) {
            navigationCallback('/landing');
          }
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token available, redirect to landing page
        TokenManager.clearTokens();
        if (navigationCallback) {
          navigationCallback('/landing');
        }
      }
    }

    try {
      const method = error.config?.method;
      if (['post', 'patch', 'delete'].includes(method)) {
        let msg = 'Thao tác thất bại';

        // Handle specific error types
        if (error.response?.status === 503) {
          msg = 'Dịch vụ AI hiện đang bận. Vui lòng thử lại sau ít phút.';
        } else if (error.response?.data?.error) {
          msg = error.response.data.error;
        } else if (error.response?.data?.message) {
          msg = error.response.data.message;
        }

        notify(msg, 'error');
      }
    } catch {}
    return Promise.reject(error);
  }
);

// Token validation function
export const validateToken = async () => {
  const token = TokenManager.getAccessToken();
  const refreshToken = TokenManager.getRefreshToken();

  // Token is valid if both access and refresh tokens exist
  return !!(token && refreshToken);
};

// Initialize token validation on app load
export const initializeAuth = async () => {
  const token = TokenManager.getAccessToken();
  if (!token) {
    return false;
  }

  const isValid = await validateToken();
  if (!isValid && navigationCallback) {
    navigationCallback('/landing');
  }
  return isValid;
};

export { apiClient, TokenManager };
export default apiClient;