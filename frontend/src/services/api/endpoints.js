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
  
  // Checklists and related resources
  CHECKLISTS: {
    ROOT: '/checklists',
    BY_ID: (id) => `/checklists/${id}`,
    CATEGORIES: (checklistId) => `/checklists/${checklistId}/categories`,
    CATEGORY_BY_ID: (categoryId) => `/checklists/categories/${categoryId}`,
    ITEMS_IN_CATEGORY: (categoryId) => `/checklists/categories/${categoryId}/items`,
    ITEM_BY_ID: (itemId) => `/checklists/items/${itemId}`,
    ITEM_FILES: (itemId) => `/checklists/items/${itemId}/files`,
  },

  // Normalized item routes (same targets as CHECKLISTS.* above)
  ITEMS: {
    ROOT: '/checklists/items',
    BY_ID: (itemId) => `/checklists/items/${itemId}`,
    FILES: (itemId) => `/checklists/items/${itemId}/files`,
    IN_CATEGORY: (categoryId) => `/checklists/categories/${categoryId}/items`,
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