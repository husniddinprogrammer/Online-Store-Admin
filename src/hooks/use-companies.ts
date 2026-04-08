"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { companiesService } from "@/services/companies.service";
import type { CompanyRequest, PaginationParams } from "@/types";
import { toast } from "sonner";

export const companyKeys = {
  all: ["companies"] as const,
  lists: () => [...companyKeys.all, "list"] as const,
  list: (params?: PaginationParams) => [...companyKeys.lists(), params] as const,
};

export function useCompanies(params?: PaginationParams) {
  return useQuery({
    queryKey: companyKeys.list(params),
    queryFn: () => companiesService.getAll(params),
  });
}

export function useCreateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CompanyRequest) => companiesService.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: companyKeys.lists() });
      toast.success("Company created");
    },
    onError: () => toast.error("Failed to create company"),
  });
}

export function useUpdateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: CompanyRequest }) =>
      companiesService.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: companyKeys.lists() });
      toast.success("Company updated");
    },
    onError: () => toast.error("Failed to update company"),
  });
}

export function useDeleteCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => companiesService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: companyKeys.lists() });
      toast.success("Company deleted");
    },
    onError: () => toast.error("Failed to delete company"),
  });
}
