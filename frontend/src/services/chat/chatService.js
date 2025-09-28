import apiClient from '../api/apiClient.js';
import API_ENDPOINTS from '../api/endpoints.js';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // Start with 1 second
const RETRY_BACKOFF_FACTOR = 2;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const chatService = {
  async sendMessage({ content, conversationId = null }) {
    let lastError;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const res = await apiClient.post(API_ENDPOINTS.CHAT.SEND_MESSAGE, {
          content,
          conversation_id: conversationId || undefined,
        });
        return res.data;
      } catch (error) {
        lastError = error;

        // Only retry on 503 errors (service unavailable)
        if (error.response?.status !== 503) {
          throw error;
        }

        // Don't retry on the last attempt
        if (attempt === MAX_RETRIES) {
          throw error;
        }

        // Exponential backoff delay
        const delay = RETRY_DELAY * Math.pow(RETRY_BACKOFF_FACTOR, attempt);
        await sleep(delay);
      }
    }

    throw lastError;
  },

  async renameConversation(conversationId, title) {
    const res = await apiClient.patch(API_ENDPOINTS.CHAT.RENAME_CONVERSATION(conversationId), { title });
    return res.data;
  },

  async getConversations() {
    const res = await apiClient.get(API_ENDPOINTS.CHAT.GET_CONVERSATIONS);
    return res.data?.conversations || [];
  },

  async getHistory(conversationId) {
    const res = await apiClient.get(API_ENDPOINTS.CHAT.GET_HISTORY(conversationId));
    return res.data?.messages || [];
  },

  async deleteConversation(conversationId) {
    const res = await apiClient.delete(API_ENDPOINTS.CHAT.DELETE_CONVERSATION(conversationId));
    return res.data;
  },

  async togglePin(conversationId, pinned) {
    const res = await apiClient.patch(API_ENDPOINTS.CHAT.PIN_CONVERSATION(conversationId), { pinned });
    return res.data;
  },
};

export default chatService;


