import { api } from "@/lib/api";
import type { ApiResponse, PaginatedResponse, PaginationParams, Poster } from "@/types";

export const postersService = {
  getAll: async (params?: PaginationParams) => {
    const { data } = await api.get<ApiResponse<PaginatedResponse<Poster>>>("/api/posters", { params });
    return data.data;
  },

  /**
   * POST /api/posters
   * Multipart: image (file) + link (optional string)
   */
  create: async (image: File, link?: string) => {
    const formData = new FormData();
    formData.append("image", image);
    if (link?.trim()) formData.append("link", link.trim());
    const { data } = await api.post<ApiResponse<Poster>>("/api/posters", formData);
    return data.data;
  },

  /**
   * PUT /api/posters/{id}
   * Replaces the image only.
   */
  update: async (id: number, image: File) => {
    const formData = new FormData();
    formData.append("image", image);
    const { data } = await api.put<ApiResponse<Poster>>(`/api/posters/${id}`, formData);
    return data.data;
  },

  delete: async (id: number) => {
    await api.delete(`/api/posters/${id}`);
  },
};
