"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reviewsService } from "@/services/reviews.service";
import type { CreateReviewRequest } from "@/types";
import { toast } from "sonner";

export const reviewKeys = {
  all: ["reviews"] as const,
  my: () => [...reviewKeys.all, "my"] as const,
};

export function useMyReviews() {
  return useQuery({
    queryKey: reviewKeys.my(),
    queryFn: () => reviewsService.getMyReviews(),
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateReviewRequest) => reviewsService.create(request),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reviewKeys.my() });
      toast.success("Review submitted");
    },
    onError: () => toast.error("Failed to submit review"),
  });
}
