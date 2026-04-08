import { api } from "@/lib/api";
import type { ApiResponse, AuthResponse, LoginRequest, RegisterRequest } from "@/types";

export const authService = {
  login: async (body: LoginRequest) => {
    const { data } = await api.post<ApiResponse<AuthResponse>>("/api/auth/login", body);
    return data.data;
  },

  register: async (body: RegisterRequest) => {
    const { data } = await api.post<ApiResponse<AuthResponse>>("/api/auth/register", body);
    return data.data;
  },

  logout: async (refreshToken: string) => {
    await api.post("/api/auth/logout", { refreshToken });
  },

  refreshToken: async (refreshToken: string) => {
    const { data } = await api.post<ApiResponse<AuthResponse>>("/api/auth/refresh-token", {
      refreshToken,
    });
    return data.data;
  },

  forgotPassword: async (email: string) => {
    const { data } = await api.post<ApiResponse<null>>("/api/auth/forgot-password", { email });
    return data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const { data } = await api.post<ApiResponse<null>>("/api/auth/reset-password", {
      token,
      newPassword,
    });
    return data;
  },
};
