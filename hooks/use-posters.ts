"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { postersService } from "@/services/posters.service";
import type { PaginationParams } from "@/types";
import { toast } from "sonner";

export const posterKeys = {
  all: ["posters"] as const,
  lists: () => [...posterKeys.all, "list"] as const,
  list: (params?: PaginationParams) => [...posterKeys.lists(), params] as const,
};

export function usePosters(params?: PaginationParams) {
  return useQuery({
    queryKey: posterKeys.list(params),
    queryFn: () => postersService.getAll(params),
  });
}

export function useCreatePoster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ image, link }: { image: File; link?: string }) =>
      postersService.create(image, link),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: posterKeys.lists() });
      toast.success("Poster created");
    },
    onError: () => toast.error("Failed to create poster"),
  });
}

export function useUpdatePoster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, image }: { id: number; image: File }) =>
      postersService.update(id, image),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: posterKeys.lists() });
      toast.success("Poster updated");
    },
    onError: () => toast.error("Failed to update poster"),
  });
}

export function useDeletePoster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => postersService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: posterKeys.lists() });
      toast.success("Poster deleted");
    },
    onError: () => toast.error("Failed to delete poster"),
  });
}
