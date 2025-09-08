// API endpoint definitions
const API_ENDPOINTS = {
  // Authentication endpoints (no /api prefix as per backend structure)
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  
  // Future chat endpoints
  CHAT: {
    MAIN_CHAT_PAGE: '/chat',
    SEND_MESSAGE: '/chat/send',
    GET_HISTORY: '/chat/history',
    GET_CONVERSATIONS: '/chat/conversations',
    CREATE_CONVERSATION: '/chat/conversations',
    DELETE_CONVERSATION: '/chat/conversations',
  },
  
  // User management endpoints
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    CHANGE_PASSWORD: '/user/change-password',
    DELETE_ACCOUNT: '/user/delete',
  },

  // Guest chat endpoints (for non-authenticated users)
  GUEST: {
    CHAT: '/guest/chat',
  },
};

export default API_ENDPOINTS;