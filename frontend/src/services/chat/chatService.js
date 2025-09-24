import apiClient from '../api/apiClient.js';
import API_ENDPOINTS from '../api/endpoints.js';

const chatService = {
  async sendMessage({ content, conversationId = null }) {
    const res = await apiClient.post(API_ENDPOINTS.CHAT.SEND_MESSAGE, {
      content,
      conversation_id: conversationId || undefined,
    });
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
};

export default chatService;


