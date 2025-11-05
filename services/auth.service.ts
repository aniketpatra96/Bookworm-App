import axios, { AxiosResponse } from "axios";

interface userData {
  username?: string;
  email?: string;
  password: string;
}

class AuthService {
  private api: string | undefined;

  constructor() {
    this.api = process.env.EXPO_PUBLIC_API_URL;
  }

  async register(userData: userData) {
    try {
      const response: AxiosResponse<any, any, {}> = await axios.post(
        `${this.api}/api/auth/register`,
        userData
      );
      if (response.status !== 201) {
        throw new Error("Registration failed !");
      }
      return response.data;
    } catch (error: any) {
      console.error(error.message);
      return { error: error.message };
    }
  }

  async login(userData: userData) {
    try {
      const response: AxiosResponse<any, any, {}> = await axios.post(
        `${this.api}/api/auth/login`,
        userData
      );
      if (response.status !== 200) {
        throw new Error("Login failed !");
      }
      return response.data;
    } catch (error: any) {
      console.error(error.message);
      return { error: "Invalid Credentials !!" };
    }
  }
}

export default new AuthService();
