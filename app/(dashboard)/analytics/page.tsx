"use client";

import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  PackagePlus,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { FilterBar } from "@/components/analytics/filter-bar";
import { AnimatedStatCard } from "@/components/analytics/animated-stat-card";
import { RevenueChart } from "@/components/analytics/revenue-chart";
import { ProductsChart } from "@/components/analytics/products-chart";
import { TopProductsTable } from "@/components/analytics/top-products-table";
import { useAnalytics } from "@/hooks/use-analytics";
import { formatCurrency } from "@/lib/utils";
import type { AnalyticsParams } from "@/types";

// ─── Default filter ───────────────────────────────────────────────────────────

const DEFAULT_PARAMS: AnalyticsParams = { period: "MONTHLY", topLimit: 10 };

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [params, setParams] = useState<AnalyticsParams>(DEFAULT_PARAMS);

  // Block query when CUSTOM period is selected but dates aren't filled yet
  const queryReady =
    params.period !== "CUSTOM" ||
    (!!params.fromDate && !!params.toDate);

  const { data, isLoading, isError } = useAnalytics(params);

  const handleFilterChange = (next: AnalyticsParams) => {
    setParams(next);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Analytics"
        description="Performance insights for your store"
      />

      {/* Filters */}
      <FilterBar value={params} onChange={handleFilterChange} isLoading={isLoading} />

      {/* Custom range — waiting for dates */}
      {params.period === "CUSTOM" && !queryReady && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Select both From and To dates to load analytics
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Failed to load analytics. Please try again.
        </div>
      )}

      {/* Stats Grid — 1 col → 2 col → 3 col (2 symmetric rows of 3) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatedStatCard
          index={0}
          title="Total Profit"
          value={data?.totalProfit ?? 0}
          format={(n) => formatCurrency(n)}
          icon={TrendingUp}
          color="emerald"
          isLoading={isLoading}
        />
        <AnimatedStatCard
          index={1}
          title="Total Revenue"
          value={data?.totalRevenue ?? 0}
          format={(n) => formatCurrency(n)}
          icon={DollarSign}
          color="blue"
          isLoading={isLoading}
        />
        <AnimatedStatCard
          index={2}
          title="Orders"
          value={data?.totalOrdersCount ?? 0}
          icon={ShoppingCart}
          color="orange"
          isLoading={isLoading}
        />
        <AnimatedStatCard
          index={3}
          title="Items Sold"
          value={data?.totalSoldProductsCount ?? 0}
          icon={Package}
          color="purple"
          isLoading={isLoading}
        />
        <AnimatedStatCard
          index={4}
          title="New Users"
          value={data?.totalUsersAdded ?? 0}
          icon={Users}
          color="cyan"
          isLoading={isLoading}
        />
        <AnimatedStatCard
          index={5}
          title="New Products"
          value={data?.totalProductsAdded ?? 0}
          icon={PackagePlus}
          color="pink"
          isLoading={isLoading}
        />
      </div>

      {/* Charts */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        <RevenueChart data={data?.revenueChartData} isLoading={isLoading} />
        <ProductsChart data={data?.topSellingProducts} isLoading={isLoading} />
      </motion.div>

      {/* Top Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.45 }}
      >
        <TopProductsTable data={data?.topSellingProducts} isLoading={isLoading} />
      </motion.div>
    </div>
  );
}
