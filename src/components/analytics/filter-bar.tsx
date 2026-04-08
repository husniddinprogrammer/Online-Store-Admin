"use client";

import { CalendarDays } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/hooks/use-translations";
import type { AnalyticsPeriod, AnalyticsParams } from "@/types";

interface FilterBarProps {
  value: AnalyticsParams;
  onChange: (params: AnalyticsParams) => void;
  isLoading?: boolean;
}

export function FilterBar({ value, onChange, isLoading }: FilterBarProps) {
  const t = useTranslations();
  const isCustom = value.period === "CUSTOM";

  const PERIODS: { value: AnalyticsPeriod; label: string }[] = [
    { value: "DAILY", label: t("analytics.today") },
    { value: "WEEKLY", label: t("analytics.thisWeek") },
    { value: "MONTHLY", label: t("analytics.thisMonth") },
    { value: "CUSTOM", label: t("analytics.customRange") },
  ];

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Period tabs */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-muted">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => onChange({ ...value, period: p.value })}
            disabled={isLoading}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 disabled:opacity-50",
              value.period === p.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom date range */}
      {isCustom && (
        <div className="flex items-center gap-2">
          <div className="relative">
            <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="date"
              value={value.fromDate ?? ""}
              onChange={(e) => onChange({ ...value, fromDate: e.target.value })}
              className={cn(
                "h-9 pl-8 pr-3 rounded-md border border-border bg-background text-sm",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                "text-foreground",
              )}
              aria-label="From date"
            />
          </div>
          <span className="text-sm text-muted-foreground">—</span>
          <div className="relative">
            <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="date"
              value={value.toDate ?? ""}
              onChange={(e) => onChange({ ...value, toDate: e.target.value })}
              className={cn(
                "h-9 pl-8 pr-3 rounded-md border border-border bg-background text-sm",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                "text-foreground",
              )}
              aria-label="To date"
            />
          </div>
        </div>
      )}

      {/* Top-N selector */}
      <div className="flex items-center gap-2 ml-auto">
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {t("analytics.topProducts_label")}
        </span>
        <Select
          value={String(value.topLimit ?? 10)}
          onValueChange={(v) => onChange({ ...value, topLimit: Number(v) })}
        >
          <SelectTrigger className="h-9 w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[5, 10, 20].map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
