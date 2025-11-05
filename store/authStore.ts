import { create, StoreApi, UseBoundStore } from "zustand";
import authService from "@/services/auth.service";
import AsyncStorage, {
  AsyncStorageStatic,
} from "@react-native-async-storage/async-storage";
import { jwtDecode, JwtPayload } from "jwt-decode";

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

interface User {
  _id?: string;
  email?: string;
  username?: string;
  profileImage?: string;
  createdAt?: string;
  password: string;
}

export type LoggedInUser = Omit<User, "password">;

const useAuthStore: UseBoundStore<StoreApi<AuthState>> = create<AuthState>(
  (set) => ({
    user: null,
    token: null,
    isLoading: false,
    isCheckingAuth: true,

    register: async (username, email, password) => {
      set({ isLoading: true });
      const storage: AsyncStorageStatic = AsyncStorage;
      try {
        const user: User = { username, email, password };
        const data: any = await authService.register(user);
        if (data?.error) {
          throw new Error(data.error);
        }
        const decodedData: JwtPayload = jwtDecode(data.token);
        const parsedData: any = JSON.parse(JSON.stringify(decodedData));
        await storage.setItem("user", JSON.stringify(parsedData.user));
        await storage.setItem("token", data.token);
        set({ user: parsedData.user, token: data.token, isLoading: false });
        return { success: true };
      } catch (error: any) {
        console.error("Registration error:", error);
        set({ isLoading: false });
        return { success: false, error: error.message };
      }
    },

    checkAuth: async () => {
      const storage: AsyncStorageStatic = AsyncStorage;
      try {
        const token: string | null = await storage.getItem("token");
        const userJson: string | null = await storage.getItem("user");
        const user: any = userJson ? JSON.parse(userJson) : null;
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
      const storage: AsyncStorageStatic = AsyncStorage;
      set({ isLoading: true });
      try {
        const user: User = { email, password };
        const data: any = await authService.login(user);
        if (data?.error) {
          throw new Error(data.error);
        }
        const decodedData: JwtPayload = jwtDecode(data.token);
        const parsedData: any = JSON.parse(JSON.stringify(decodedData));
        await storage.setItem("user", JSON.stringify(parsedData.user));
        await storage.setItem("token", data.token);
        set({ user: parsedData.user, token: data.token, isLoading: false });
        return { success: true };
      } catch (error: any) {
        console.error("Login error:", error);
        set({ isLoading: false });
        return { success: false, error: error.message };
      }
    },

    logout: async () => {
      const storage: AsyncStorageStatic = AsyncStorage;
      await storage.removeItem("user");
      await storage.removeItem("token");
      set({ user: null, token: null });
    },
  })
);

export default useAuthStore;
