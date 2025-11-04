import { create, StoreApi, UseBoundStore } from "zustand";
import authService from "@/services/auth.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

interface AuthState {
  user: any | null;
  token: string | null;
  isLoading: boolean;
  isCheckingAuth: boolean;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const useAuthStore: UseBoundStore<StoreApi<AuthState>> = create<AuthState>(
  (set) => ({
    user: null,
    token: null,
    isLoading: false,
    isCheckingAuth: true,

    register: async (username, email, password) => {
      set({ isLoading: true });
      try {
        const user = { username, email, password };
        const data = await authService.register(user);
        if (data?.error) {
          throw new Error(data.error);
        }
        const decodedData = jwtDecode(data.token);
        const parsedData = JSON.parse(JSON.stringify(decodedData));
        await AsyncStorage.setItem("user", JSON.stringify(parsedData.user));
        await AsyncStorage.setItem("token", data.token);
        set({ user: parsedData.user, token: data.token, isLoading: false });
        return { success: true };
      } catch (error: any) {
        console.error("Registration error:", error);
        set({ isLoading: false });
        return { success: false, error: error.message };
      }
    },

    checkAuth: async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const userJson = await AsyncStorage.getItem("user");
        const user = userJson ? JSON.parse(userJson) : null;
        if (token && user) {
          set({ token, user });
        }
      } catch (error) {
        console.error("Auth check failed ", error);
      } finally {
        set({ isCheckingAuth: false });
      }
    },

    login: async (email, password) => {
      set({ isLoading: true });
      try {
        const user = { email, password };
        const data = await authService.login(user);
        if (data?.error) {
          throw new Error(data.error);
        }
        const decodedData = jwtDecode(data.token);
        const parsedData = JSON.parse(JSON.stringify(decodedData));
        await AsyncStorage.setItem("user", JSON.stringify(parsedData.user));
        await AsyncStorage.setItem("token", data.token);
        set({ user: parsedData.user, token: data.token, isLoading: false });
        return { success: true };
      } catch (error: any) {
        console.error("Login error:", error);
        set({ isLoading: false });
        return { success: false, error: error.message };
      }
    },

    logout: async () => {
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("token");
      set({ user: null, token: null });
    },
  })
);

export default useAuthStore;
