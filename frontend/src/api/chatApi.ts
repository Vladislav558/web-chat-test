import axios from "axios";

const API_URL = "http://localhost:5000/api/chat";
const USERS_API_URL = "http://localhost:5000/api/users";

export const chatApi = {
  loadHistory: async (userId: string, lastMessageId?: string) => {
    const params = new URLSearchParams({ userId });
    if (lastMessageId) params.append("lastMessageId", lastMessageId);

    const response = await axios.get(`${API_URL}/history?${params.toString()}`, {
      withCredentials: true,
    });

    return response.data.reverse();
  },

  loadOnlineUsers: async () => {
    const response = await axios.get(`${USERS_API_URL}/online`, {
      withCredentials: true,
    });

    return response.data;
  },
};
