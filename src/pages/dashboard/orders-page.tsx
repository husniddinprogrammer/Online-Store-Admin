"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { OrderStatusBadge } from "@/components/shared/order-status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useOrders, useUpdateOrderStatus } from "@/hooks/use-orders";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTranslations } from "@/hooks/use-translations";
import { useCanEdit } from "@/hooks/use-can-edit";
import type { OrderStatus, Order } from "@/types";

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: "PAID",
  PAID: "SHIPPED",
  SHIPPED: "DELIVERED",
};

function OrderRow({ order }: { order: Order }) {
  const t = useTranslations();
  const canEdit = useCanEdit();
  const [expanded, setExpanded] = useState(false);
  const updateStatus = useUpdateOrderStatus();

  const nextStatus = NEXT_STATUS[order.status];

  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-muted/30"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <TableCell>
          <div className="flex items-center gap-2">
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="font-medium text-sm">#{order.id}</span>
          </div>
        </TableCell>
        <TableCell className="text-sm">{order.userName}</TableCell>
        <TableCell>
          <OrderStatusBadge status={order.status} />
        </TableCell>
        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
          {order.items?.length ?? 0} {t("orders.items").toLowerCase()}
        </TableCell>
        <TableCell className="text-sm font-semibold">{formatCurrency(order.totalAmount)}</TableCell>
        <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
          {formatDate(order.createdAt)}
        </TableCell>
        <TableCell onClick={(e) => e.stopPropagation()}>
          {canEdit && nextStatus && (
            <Button
              size="sm"
              variant="outline"
              disabled={updateStatus.isPending}
              onClick={() => updateStatus.mutate({ id: order.id, status: nextStatus })}
              className="text-xs h-7"
            >
              → {nextStatus}
            </Button>
          )}
          {canEdit && order.status === "PENDING" && (
            <Button
              size="sm"
              variant="ghost"
              disabled={updateStatus.isPending}
              onClick={() => updateStatus.mutate({ id: order.id, status: "CANCELLED" })}
              className="text-xs h-7 text-destructive hover:text-destructive ml-1"
            >
              Cancel
            </Button>
          )}
        </TableCell>
      </TableRow>

      {expanded && (
        <TableRow>
          <TableCell colSpan={7} className="bg-muted/20 px-6 py-4">
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {order.deliveryAddress && (
                  <div>
                    <p className="font-medium text-muted-foreground mb-1">
                      {t("orders.deliveryAddress")}
                    </p>
                    <p>
                      {order.deliveryAddress.regionType} — {order.deliveryAddress.cityType}
                    </p>
                    <p>
                      House {order.deliveryAddress.homeNumber}, Room{" "}
                      {order.deliveryAddress.roomNumber}
                    </p>
                  </div>
                )}
                {order.note && (
                  <div>
                    <p className="font-medium text-muted-foreground mb-1">{t("orders.note")}</p>
                    <p className="italic">{order.note}</p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="font-medium text-sm">{t("orders.orderItems")}</p>
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        ×{item.quantity}
                      </Badge>
                      <span>{item.productName}</span>
                    </div>
                    <span className="font-medium">{formatCurrency(item.totalPrice)}</span>
                  </div>
                ))}
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export default function OrdersPage() {
  const t = useTranslations();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const STATUS_OPTIONS: { value: OrderStatus | "ALL"; label: string }[] = [
    { value: "ALL", label: t("orders.allStatuses") },
    { value: "PENDING", label: "Pending" },
    { value: "PAID", label: "Paid" },
    { value: "SHIPPED", label: "Shipped" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  const { data, isLoading } = useOrders({
    status: statusFilter === "ALL" ? undefined : statusFilter,
    page,
    size: pageSize,
    sort: "createdAt,desc",
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title={t("orders.title")}
        description={t("orders.subtitle", { count: data?.totalElements ?? "..." })}
      />

      <Card>
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as OrderStatus | "ALL");
              setPage(0);
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("orders.order")}</TableHead>
                <TableHead>{t("orders.customer")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead className="hidden md:table-cell">{t("orders.items")}</TableHead>
                <TableHead>{t("orders.total")}</TableHead>
                <TableHead className="hidden lg:table-cell">{t("common.date")}</TableHead>
                <TableHead>{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-8 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : data?.content.map((order) => <OrderRow key={order.id} order={order} />)}
            </TableBody>
          </Table>
        </div>

        {data && (
          <div className="p-4">
            <DataTablePagination
              page={page}
              pageSize={pageSize}
              totalElements={data.totalElements}
              totalPages={data.totalPages}
              onPageChange={setPage}
              onPageSizeChange={(s) => {
                setPageSize(s);
                setPage(0);
              }}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
