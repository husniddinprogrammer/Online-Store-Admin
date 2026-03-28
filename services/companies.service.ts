import { api } from "@/lib/api";
import type { ApiResponse, Company, CompanyRequest, PaginatedResponse, PaginationParams } from "@/types";

export const companiesService = {
  getAll: async (params?: PaginationParams) => {
    const { data } = await api.get<ApiResponse<PaginatedResponse<Company>>>("/api/companies", { params });
    return data.data;
  },

  getById: async (id: number) => {
    const { data } = await api.get<ApiResponse<Company>>(`/api/companies/${id}`);
    return data.data;
  },

  create: async (body: CompanyRequest) => {
    const { data } = await api.post<ApiResponse<Company>>("/api/companies", body);
    return data.data;
  },

  update: async (id: number, body: CompanyRequest) => {
    const { data } = await api.put<ApiResponse<Company>>(`/api/companies/${id}`, body);
    return data.data;
  },

  delete: async (id: number) => {
    await api.delete(`/api/companies/${id}`);
  },
};
