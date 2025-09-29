import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get user information from localStorage
 * User data is stored during login/register and should be available locally
 * @returns {Object|null} User data or null if not found
 */
export function getUserFromToken() {
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data from localStorage:', error);
    return null;
  }
}

/**
 * Check if user is authenticated by checking if tokens exist
 * @returns {boolean} True if user has valid tokens
 */
export function isUserAuthenticated() {
  try {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    return !!(accessToken && refreshToken);
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return false;
  }
}
