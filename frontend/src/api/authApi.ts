import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

export const authApi = {
  register: async (data: { email: string; firstName: string; lastName?: string; password: string }) => {
    try {
      const response = await axios.post(`${API_URL}/register`, data, { withCredentials: true });
      return response.data;
    } catch (err: any) {
      console.error("Register Error:", err.response);
      throw err.response?.data || { message: "Ошибка сервера" };
    }
  },

  verify: async (data: { email: string; code: string; rememberMe: boolean }) => {
    try {
      const response = await axios.post(`${API_URL}/verify`, data, { withCredentials: true });
      return response.data;
    } catch (err: any) {
      console.error("Verify Error:", err.response);
      throw err.response?.data || { message: "Ошибка сервера" };
    }
  },

  login: async (data: { email: string; password: string; rememberMe: boolean }) => {
    try {
      const response = await axios.post(`${API_URL}/login`, data, { withCredentials: true });
      return response.data;
    } catch (err: any) {
      console.error("Login Error:", err.response);
      throw err.response?.data || { message: "Ошибка сервера" };
    }
  },

  logout: async () => {
    try {
      const response = await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
      return response.data;
    } catch (err: any) {
      console.error("Logout Error:", err.response);
      throw err.response?.data || { message: "Ошибка сервера" };
    }
  },

  checkAuth: async () => {
    try {
      const response = await axios.get(`${API_URL}/token`, { withCredentials: true });
      return response.data;
    } catch (err: any) {
      console.error("CheckAuth Error:", err.response);
      throw err.response?.data || { message: "Ошибка проверки авторизации" };
    }
  },
};

