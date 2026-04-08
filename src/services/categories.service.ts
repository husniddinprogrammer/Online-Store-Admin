import { api } from "@/lib/api";
import type {
  ApiResponse,
  Category,
  CategoryRequest,
  PaginatedResponse,
  PaginationParams,
} from "@/types";

/**
 * Build multipart/form-data for category endpoints.
 *
 * The backend uses @RequestPart("data") for the JSON payload and
 * @RequestPart("image") for the file, matching the curl form:
 *   -F 'data={"name":"..."};type=application/json'
 *   -F "image=@file.jpg"
 */
function buildFormData(body: CategoryRequest): FormData {
  const formData = new FormData();
  formData.append(
    "data",
    new Blob([JSON.stringify({ name: body.name })], { type: "application/json" }),
  );
  if (body.image) {
    formData.append("image", body.image);
  }
  return formData;
}

export const categoriesService = {
  getAll: async (params?: PaginationParams) => {
    const { data } = await api.get<ApiResponse<PaginatedResponse<Category>>>("/api/categories", {
      params,
    });
    return data.data;
  },

  getById: async (id: number) => {
    const { data } = await api.get<ApiResponse<Category>>(`/api/categories/${id}`);
    return data.data;
  },

  create: async (body: CategoryRequest) => {
    const { data } = await api.post<ApiResponse<Category>>("/api/categories", buildFormData(body));
    return data.data;
  },

  update: async (id: number, body: CategoryRequest) => {
    const { data } = await api.put<ApiResponse<Category>>(
      `/api/categories/${id}`,
      buildFormData(body),
    );
    return data.data;
  },

  delete: async (id: number) => {
    await api.delete(`/api/categories/${id}`);
  },
};
