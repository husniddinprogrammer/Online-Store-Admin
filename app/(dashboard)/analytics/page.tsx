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
import { useTranslations } from "@/hooks/use-translations";
import type { AnalyticsParams } from "@/types";

const DEFAULT_PARAMS: AnalyticsParams = { period: "MONTHLY", topLimit: 10 };

export default function AnalyticsPage() {
  const t = useTranslations();
  const [params, setParams] = useState<AnalyticsParams>(DEFAULT_PARAMS);

  const queryReady =
    params.period !== "CUSTOM" ||
    (!!params.fromDate && !!params.toDate);

  const { data, isLoading, isError } = useAnalytics(params);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title={t("analytics.title")}
        description={t("analytics.subtitle")}
      />

      <FilterBar value={params} onChange={setParams} isLoading={isLoading} />

      {params.period === "CUSTOM" && !queryReady && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {t("analytics.selectDates")}
        </div>
      )}

      {isError && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {t("analytics.loadError")}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatedStatCard
          index={0}
          title={t("analytics.totalProfit")}
          value={data?.totalProfit ?? 0}
          format={(n) => formatCurrency(n)}
          icon={TrendingUp}
          color="emerald"
          isLoading={isLoading}
        />
        <AnimatedStatCard
          index={1}
          title={t("analytics.totalRevenue")}
          value={data?.totalRevenue ?? 0}
          format={(n) => formatCurrency(n)}
          icon={DollarSign}
          color="blue"
          isLoading={isLoading}
        />
        <AnimatedStatCard
          index={2}
          title={t("analytics.orders")}
          value={data?.totalOrdersCount ?? 0}
          icon={ShoppingCart}
          color="orange"
          isLoading={isLoading}
        />
        <AnimatedStatCard
          index={3}
          title={t("analytics.itemsSold")}
          value={data?.totalSoldProductsCount ?? 0}
          icon={Package}
          color="purple"
          isLoading={isLoading}
        />
        <AnimatedStatCard
          index={4}
          title={t("analytics.newUsers")}
          value={data?.totalUsersAdded ?? 0}
          icon={Users}
          color="cyan"
          isLoading={isLoading}
        />
        <AnimatedStatCard
          index={5}
          title={t("analytics.newProducts")}
          value={data?.totalProductsAdded ?? 0}
          icon={PackagePlus}
          color="pink"
          isLoading={isLoading}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        <RevenueChart data={data?.revenueChartData} isLoading={isLoading} />
        <ProductsChart data={data?.topSellingProducts} isLoading={isLoading} />
      </motion.div>

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
