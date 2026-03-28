import { api } from "@/lib/api";
import type { ApiResponse, Comment, PaginatedResponse, PaginationParams } from "@/types";

export const commentsService = {
  getByProduct: async (productId: number, params?: PaginationParams) => {
    const { data } = await api.get<ApiResponse<PaginatedResponse<Comment>>>(
      `/api/comments/product/${productId}`,
      { params }
    );
    return data.data;
  },

  delete: async (id: number) => {
    await api.delete(`/api/comments/${id}`);
  },
};
