import { api } from "@/lib/api";
import type {
  ApiResponse,
  PaginatedResponse,
  Product,
  ProductQueryParams,
  ProductRequest,
} from "@/types";

export const productsService = {
  getAll: async (params?: ProductQueryParams) => {
    const { data } = await api.get<ApiResponse<PaginatedResponse<Product>>>("/api/products", {
      params,
    });
    return data.data;
  },

  getById: async (id: number) => {
    const { data } = await api.get<ApiResponse<Product>>(`/api/products/${id}`);
    return data.data;
  },

  create: async (body: ProductRequest) => {
    const { data } = await api.post<ApiResponse<Product>>("/api/products", body);
    return data.data;
  },

  update: async (id: number, body: ProductRequest) => {
    const { data } = await api.put<ApiResponse<Product>>(`/api/products/${id}`, body);
    return data.data;
  },

  delete: async (id: number) => {
    await api.delete(`/api/products/${id}`);
  },

  addImage: async (productId: number, imageLink: string, isMain = false) => {
    const { data } = await api.post(`/api/product-images/product/${productId}`, null, {
      params: { imageLink, isMain },
    });
    return data;
  },

  deleteImage: async (imageId: number) => {
    await api.delete(`/api/product-images/${imageId}`);
  },

  setMainImage: async (imageId: number) => {
    await api.patch(`/api/product-images/${imageId}/main`);
  },
};
