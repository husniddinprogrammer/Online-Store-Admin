import { api } from "@/lib/api";
import type { ApiResponse, CreateReviewRequest, MyReviewsResponse } from "@/types";

export const reviewsService = {
  getMyReviews: async () => {
    const { data } = await api.get<ApiResponse<MyReviewsResponse>>("/api/reviews/my");
    return data.data;
  },

  create: async (request: CreateReviewRequest) => {
    const { data } = await api.post<ApiResponse<void>>("/api/reviews", request);
    return data;
  },
};
