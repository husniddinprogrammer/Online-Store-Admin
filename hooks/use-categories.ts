"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoriesService } from "@/services/categories.service";
import type { CategoryRequest, PaginationParams } from "@/types";
import { toast } from "sonner";

export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (params?: PaginationParams) => [...categoryKeys.lists(), params] as const,
};

export function useCategories(params?: PaginationParams) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => categoriesService.getAll(params),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CategoryRequest) => categoriesService.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast.success("Category created");
    },
    onError: () => toast.error("Failed to create category"),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: CategoryRequest }) => categoriesService.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast.success("Category updated");
    },
    onError: () => toast.error("Failed to update category"),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => categoriesService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast.success("Category deleted");
    },
    onError: () => toast.error("Failed to delete category"),
  });
}
