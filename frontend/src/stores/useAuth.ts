import { create } from "zustand";
import { authApi } from "@/api/authApi";
import { AuthStore } from "@/types/auth";

export const useAuth = create<AuthStore>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,

  checkAuth: async () => {
    try {
      const response = await authApi.checkAuth();
      console.log(response)
      if (response.status === "success") {
        set({ isAuthenticated: true, user: response.data, isLoading: false });
      } else {
        set({ isAuthenticated: false, user: null, isLoading: false });
      }
    } catch {
      set({ isAuthenticated: false, user: null, isLoading: false });
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
      set({ isAuthenticated: false, user: null });
    } catch {
      console.error("Error on exit");
    }
  },
}));
