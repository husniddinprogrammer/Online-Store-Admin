"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsService } from "@/services/notifications.service";
import type { PaginationParams } from "@/types";
import { toast } from "sonner";

export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (params?: PaginationParams) => [...notificationKeys.lists(), params] as const,
  unseenCount: () => [...notificationKeys.all, "unseen-count"] as const,
};

export function useNotifications(params?: PaginationParams) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationsService.getAll(params),
  });
}

export function useUnseenNotificationCount() {
  return useQuery({
    queryKey: notificationKeys.unseenCount(),
    queryFn: () => notificationsService.getUnseenCount(),
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationSeen() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationsService.markSeen(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkAllNotificationsSeen() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsService.markAllSeen(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success("All notifications marked as seen");
    },
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationsService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
  });
}
