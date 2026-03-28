"use client";

import { Users, ShoppingCart, DollarSign, Package, TrendingUp, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { StatsCard } from "@/components/shared/stats-card";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderStatusBadge } from "@/components/shared/order-status-badge";
import { useUsers } from "@/hooks/use-users";
import { useOrders } from "@/hooks/use-orders";
import { useProducts } from "@/hooks/use-products";
import { useNotifications } from "@/hooks/use-notifications";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export default function DashboardPage() {
  const { data: usersData, isLoading: usersLoading } = useUsers({ size: 1 });
  const { data: ordersData, isLoading: ordersLoading } = useOrders({ size: 5, sort: "createdAt,desc" });
  const { data: productsData, isLoading: productsLoading } = useProducts({ size: 1 });
  const { data: notificationsData, isLoading: notifsLoading } = useNotifications({ size: 5 });

  const totalRevenue = ordersData?.content
    .filter((o) => o.status === "DELIVERED" || o.status === "PAID")
    .reduce((sum, o) => sum + o.totalAmount, 0) ?? 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader title="Dashboard" description="Overview of your store performance" />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {usersLoading ? (
          <Skeleton className="h-[108px] rounded-xl" />
        ) : (
          <StatsCard
            index={0}
            title="Total Users"
            value={usersData?.totalElements?.toLocaleString() ?? "—"}
            icon={Users}
            description="Registered accounts"
            iconClassName="bg-blue-500/10"
          />
        )}

        {ordersLoading ? (
          <Skeleton className="h-[108px] rounded-xl" />
        ) : (
          <StatsCard
            index={1}
            title="Total Orders"
            value={ordersData?.totalElements?.toLocaleString() ?? "—"}
            icon={ShoppingCart}
            description="All time orders"
            iconClassName="bg-orange-500/10"
          />
        )}

        {productsLoading ? (
          <Skeleton className="h-[108px] rounded-xl" />
        ) : (
          <StatsCard
            index={2}
            title="Products"
            value={productsData?.totalElements?.toLocaleString() ?? "—"}
            icon={Package}
            description="Active listings"
            iconClassName="bg-purple-500/10"
          />
        )}

        <StatsCard
          index={3}
          title="Revenue"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          description="From recent orders"
          iconClassName="bg-green-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 rounded-lg" />
                ))}
              </div>
            ) : !ordersData?.content.length ? (
              <p className="text-sm text-muted-foreground text-center py-8">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {ordersData.content.map((order, i) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        #{order.id} — {order.userName}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <OrderStatusBadge status={order.status} />
                      <span className="text-sm font-semibold">{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-primary" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {notifsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 rounded-lg" />
                ))}
              </div>
            ) : !notificationsData?.content.length ? (
              <p className="text-sm text-muted-foreground text-center py-8">No notifications</p>
            ) : (
              <div className="space-y-2">
                {notificationsData.content.map((notif, i) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/40"
                  >
                    <div
                      className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                        notif.isSeen ? "bg-muted-foreground/40" : "bg-primary"
                      }`}
                    />
                    <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
                      {notif.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
