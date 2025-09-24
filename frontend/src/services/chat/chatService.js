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


