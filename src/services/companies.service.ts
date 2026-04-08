import { api } from "@/lib/api";
import type {
  ApiResponse,
  Company,
  CompanyRequest,
  PaginatedResponse,
  PaginationParams,
} from "@/types";

/**
 * Build multipart/form-data for company endpoints.
 *
 * The backend uses @RequestPart("data") for the JSON payload and
 * @RequestPart("image") for the optional file, matching the curl form:
 *   -F 'data={"name":"..."};type=application/json'
 *   -F "image=@file.jpg"   (optional)
 */
function buildFormData(body: CompanyRequest): FormData {
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

export const companiesService = {
  getAll: async (params?: PaginationParams) => {
    const { data } = await api.get<ApiResponse<PaginatedResponse<Company>>>("/api/companies", {
      params,
    });
    return data.data;
  },

  getById: async (id: number) => {
    const { data } = await api.get<ApiResponse<Company>>(`/api/companies/${id}`);
    return data.data;
  },

  create: async (body: CompanyRequest) => {
    const { data } = await api.post<ApiResponse<Company>>("/api/companies", buildFormData(body));
    return data.data;
  },

  update: async (id: number, body: CompanyRequest) => {
    const { data } = await api.put<ApiResponse<Company>>(
      `/api/companies/${id}`,
      buildFormData(body),
    );
    return data.data;
  },

  delete: async (id: number) => {
    await api.delete(`/api/companies/${id}`);
  },
};
