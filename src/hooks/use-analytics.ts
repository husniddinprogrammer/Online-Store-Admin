"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/analytics.service";
import type { AnalyticsParams } from "@/types";

export const analyticsKeys = {
  all: ["analytics"] as const,
  detail: (params: AnalyticsParams) => [...analyticsKeys.all, params] as const,
};

export function useAnalytics(params: AnalyticsParams) {
  return useQuery({
    queryKey: analyticsKeys.detail(params),
    queryFn: () => analyticsService.get(params),
    // DAILY data is fresh for 5 min, others stay cached longer
    staleTime:
      params.period === "DAILY"
        ? 5 * 60 * 1000
        : params.period === "WEEKLY"
          ? 30 * 60 * 1000
          : 60 * 60 * 1000,
  });
}
