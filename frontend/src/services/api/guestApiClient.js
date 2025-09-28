import axios from 'axios';

// Base API configuration for guest users (no authentication)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance for guest users (no auth headers)
const guestApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// No request interceptor for auth - guests don't need authentication
// No response interceptor for token refresh - guests don't have tokens

export default guestApiClient;
