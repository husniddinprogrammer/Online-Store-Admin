"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart2 } from "lucide-react";
import { useTranslations } from "@/hooks/use-translations";
import type { TopSellingProduct } from "@/types";

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as TopSellingProduct;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md text-sm space-y-1">
      <p className="font-medium text-foreground truncate max-w-[200px]">{d.name}</p>
      <p className="text-muted-foreground">
        Sold: <span className="text-foreground font-medium">{d.totalSold.toLocaleString()}</span>
      </p>
      <p className="text-muted-foreground">
        Revenue: <span className="text-primary font-medium">{d.revenue.toLocaleString()} UZS</span>
      </p>
    </div>
  );
}

interface ProductsChartProps {
  data: TopSellingProduct[] | undefined;
  isLoading: boolean;
}

export function ProductsChart({ data, isLoading }: ProductsChartProps) {
  const t = useTranslations();
  const chartData = data?.slice(0, 8).map((p) => ({
    ...p,
    shortName: p.name.length > 14 ? p.name.slice(0, 14) + "…" : p.name,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart2 className="h-4 w-4 text-primary" />
          {t("analytics.productsChart")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[220px] w-full rounded-lg" />
        ) : !chartData?.length ? (
          <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
            {t("analytics.noProductData")}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.5} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="shortName"
                tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) =>
                  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : String(v)
                }
                width={48}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--color-muted)", opacity: 0.4 }} />
              <Bar dataKey="revenue" fill="url(#barGradient)" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
