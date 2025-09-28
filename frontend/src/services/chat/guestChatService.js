import guestApiClient from '../api/guestApiClient.js';
import API_ENDPOINTS from '../api/endpoints.js';

const guestChatService = {
  async sendMessage({ messages }) {
    const res = await guestApiClient.post(API_ENDPOINTS.CHAT.SEND_MESSAGE, {
      messages,
    });
    return res.data;
  },
};

export default guestChatService;
