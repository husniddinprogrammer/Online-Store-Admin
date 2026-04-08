import { api } from "@/lib/api";
import type { AnalyticsData, AnalyticsParams, ApiResponse } from "@/types";

export const analyticsService = {
  get: async (params: AnalyticsParams) => {
    const { data } = await api.get<ApiResponse<AnalyticsData>>("/api/admin/analytics", { params });
    return data.data;
  },
};
