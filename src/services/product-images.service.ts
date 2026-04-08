import { api } from "@/lib/api";
import type { ApiResponse, ProductImage } from "@/types";

/**
 * Backend endpoint:
 *   POST /api/product-images/upload/{productId}
 *   Content-Type: multipart/form-data  (set automatically by Axios — never override)
 *
 *   Form fields:
 *     files        — one or more image files under the same "files" key
 *   Query params:
 *     firstIsMain  — boolean (default: true). Set to true on the first file only
 *                    when uploading individually for per-file progress tracking.
 *
 *   Response: ApiResponse<List<ProductImageResponse>>  (HTTP 201)
 */

export interface UploadOptions {
  /**
   * If true, the first file in this request becomes the main product image.
   * Defaults to true. Pass false for every file after the first.
   */
  firstIsMain?: boolean;
  /** Progress callback — receives 0-100 as the request progresses. */
  onProgress?: (percent: number) => void;
}

export const productImagesService = {
  /**
   * Upload a single file.
   * Returns the list of ProductImage entries created (always length 1 here).
   *
   * How to call for per-file progress while keeping firstIsMain semantics:
   *   const [first, ...rest] = filesToUpload;
   *   await upload(id, first, { firstIsMain: true  });
   *   await Promise.all(rest.map(f => upload(id, f, { firstIsMain: false })));
   */
  upload: async (
    productId: number,
    file: File,
    options: UploadOptions = {},
  ): Promise<ProductImage[]> => {
    const { firstIsMain = true, onProgress } = options;

    const formData = new FormData();
    // Field name must match @RequestParam("files") on the backend.
    // DO NOT set Content-Type manually — Axios adds the required boundary automatically.
    formData.append("files", file);

    const { data } = await api.post<ApiResponse<ProductImage[]>>(
      `/api/product-images/upload/${productId}`,
      formData,
      {
        // firstIsMain is a separate @RequestParam, so it goes in the query string
        params: { firstIsMain },
        // No Content-Type header — Axios detects FormData and sets:
        //   Content-Type: multipart/form-data; boundary=<generated>
        onUploadProgress: (event) => {
          if (event.total) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress?.(percent);
          }
        },
      },
    );

    return data.data;
  },

  /**
   * Upload multiple files in a single request (overall progress only).
   * Use this when per-file progress is not needed.
   */
  uploadBatch: async (
    productId: number,
    files: File[],
    options: UploadOptions = {},
  ): Promise<ProductImage[]> => {
    const { firstIsMain = true, onProgress } = options;

    const formData = new FormData();
    // Append each file under the same "files" key —
    // Spring's List<MultipartFile> reads them all.
    files.forEach((file) => formData.append("files", file));

    const { data } = await api.post<ApiResponse<ProductImage[]>>(
      `/api/product-images/upload/${productId}`,
      formData,
      {
        params: { firstIsMain },
        onUploadProgress: (event) => {
          if (event.total) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress?.(percent);
          }
        },
      },
    );

    return data.data;
  },

  getByProduct: async (productId: number): Promise<ProductImage[]> => {
    const { data } = await api.get<ApiResponse<ProductImage[]>>(
      `/api/product-images/product/${productId}`,
    );
    return data.data;
  },

  setMain: async (imageId: number): Promise<void> => {
    await api.patch(`/api/product-images/${imageId}/main`);
  },

  delete: async (imageId: number): Promise<void> => {
    await api.delete(`/api/product-images/${imageId}`);
  },
};
