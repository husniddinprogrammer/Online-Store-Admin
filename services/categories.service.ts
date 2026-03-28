import { api } from "@/lib/api";
import type { ApiResponse, Category, CategoryRequest, PaginatedResponse, PaginationParams } from "@/types";

export const categoriesService = {
  getAll: async (params?: PaginationParams) => {
    const { data } = await api.get<ApiResponse<PaginatedResponse<Category>>>("/api/categories", { params });
    return data.data;
  },

  getById: async (id: number) => {
    const { data } = await api.get<ApiResponse<Category>>(`/api/categories/${id}`);
    return data.data;
  },

  create: async (body: CategoryRequest) => {
    const { data } = await api.post<ApiResponse<Category>>("/api/categories", body);
    return data.data;
  },

  update: async (id: number, body: CategoryRequest) => {
    const { data } = await api.put<ApiResponse<Category>>(`/api/categories/${id}`, body);
    return data.data;
  },

  delete: async (id: number) => {
    await api.delete(`/api/categories/${id}`);
  },
};
