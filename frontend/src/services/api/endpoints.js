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
    ITEM_FILE_BY_ID: (itemId, fileId) => `/checklists/items/${itemId}/files/${fileId}`,
    TASKS_SUMMARY: '/checklists/tasks-summary',
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
    GET_HISTORY: (id) => `/chat/history/${id}`,
    GET_CONVERSATIONS: '/chat/conversations',
    CREATE_CONVERSATION: '/chat/conversations',
    DELETE_CONVERSATION: (id) => `/chat/conversations/${id}`,
    RENAME_CONVERSATION: (id) => `/chat/conversations/${id}/rename`,
    PIN_CONVERSATION: (id) => `/chat/conversations/${id}/pin`,
    STREAM: (sid) => `/chat/stream/${sid}`,
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