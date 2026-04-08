import { api } from "@/lib/api";
import type { ApiResponse, PaginatedResponse, User, UserQueryParams, UserRole } from "@/types";

export const usersService = {
  getAll: async (params?: UserQueryParams) => {
    const { data } = await api.get<ApiResponse<PaginatedResponse<User>>>("/api/users", { params });
    return data.data;
  },

  getById: async (id: number) => {
    const { data } = await api.get<ApiResponse<User>>(`/api/users/${id}`);
    return data.data;
  },

  getMe: async () => {
    const { data } = await api.get<ApiResponse<User>>("/api/users/me");
    return data.data;
  },

  block: async (id: number) => {
    const { data } = await api.patch<ApiResponse<User>>(`/api/users/${id}/block`);
    return data.data;
  },

  unblock: async (id: number) => {
    const { data } = await api.patch<ApiResponse<User>>(`/api/users/${id}/unblock`);
    return data.data;
  },

  changeRole: async (id: number, role: UserRole) => {
    const { data } = await api.patch<ApiResponse<User>>(`/api/users/${id}/role`, null, {
      params: { role },
    });
    return data.data;
  },

  delete: async (id: number) => {
    await api.delete(`/api/users/${id}`);
  },
};
