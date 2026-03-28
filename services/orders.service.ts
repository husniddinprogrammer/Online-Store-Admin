import { api } from "@/lib/api";
import type { ApiResponse, Order, OrderQueryParams, OrderStatus, PaginatedResponse } from "@/types";

export const ordersService = {
  getAll: async (params?: OrderQueryParams) => {
    const { data } = await api.get<ApiResponse<PaginatedResponse<Order>>>("/api/orders", { params });
    return data.data;
  },

  getById: async (id: number) => {
    const { data } = await api.get<ApiResponse<Order>>(`/api/orders/${id}`);
    return data.data;
  },

  updateStatus: async (id: number, status: OrderStatus) => {
    const { data } = await api.patch<ApiResponse<Order>>(`/api/orders/${id}/status`, null, {
      params: { status },
    });
    return data.data;
  },
};
