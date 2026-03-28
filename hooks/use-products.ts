"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productsService } from "@/services/products.service";
import type { ProductQueryParams, ProductRequest } from "@/types";
import { toast } from "sonner";

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (params?: ProductQueryParams) => [...productKeys.lists(), params] as const,
  detail: (id: number) => [...productKeys.all, "detail", id] as const,
};

export function useProducts(params?: ProductQueryParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productsService.getAll(params),
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsService.getById(id),
    enabled: id > 0,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ProductRequest) => productsService.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success("Product created successfully");
    },
    onError: () => toast.error("Failed to create product"),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: ProductRequest }) => productsService.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success("Product updated successfully");
    },
    onError: () => toast.error("Failed to update product"),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productsService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success("Product deleted successfully");
    },
    onError: () => toast.error("Failed to delete product"),
  });
}
