import { api } from "@/lib/api";
import type { ApiResponse, Notification, PaginatedResponse, PaginationParams } from "@/types";

export const notificationsService = {
  getAll: async (params?: PaginationParams) => {
    const { data } = await api.get<ApiResponse<PaginatedResponse<Notification>>>(
      "/api/notifications",
      { params },
    );
    return data.data;
  },

  getUnseenCount: async () => {
    const { data } = await api.get<ApiResponse<number>>("/api/notifications/unseen-count");
    return data.data;
  },

  markSeen: async (id: number) => {
    await api.patch(`/api/notifications/${id}/seen`);
  },

  markAllSeen: async () => {
    await api.patch("/api/notifications/seen-all");
  },

  delete: async (id: number) => {
    await api.delete(`/api/notifications/${id}`);
  },
};
