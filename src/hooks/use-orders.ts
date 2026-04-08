"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersService } from "@/services/orders.service";
import type { OrderQueryParams, OrderStatus } from "@/types";
import { toast } from "sonner";

export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (params?: OrderQueryParams) => [...orderKeys.lists(), params] as const,
  detail: (id: number) => [...orderKeys.all, "detail", id] as const,
};

export function useOrders(params?: OrderQueryParams) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => ordersService.getAll(params),
  });
}

export function useOrder(id: number) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => ordersService.getById(id),
    enabled: id > 0,
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) =>
      ordersService.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orderKeys.lists() });
      toast.success("Order status updated");
    },
    onError: () => toast.error("Failed to update order status"),
  });
}
