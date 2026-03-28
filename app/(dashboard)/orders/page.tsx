"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { OrderStatusBadge } from "@/components/shared/order-status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useOrders, useUpdateOrderStatus } from "@/hooks/use-orders";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { OrderStatus, Order } from "@/types";

const STATUS_OPTIONS: { value: OrderStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: "PAID",
  PAID: "SHIPPED",
  SHIPPED: "DELIVERED",
};

function OrderRow({ order }: { order: Order }) {
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
          {order.items?.length ?? 0} items
        </TableCell>
        <TableCell className="text-sm font-semibold">{formatCurrency(order.totalAmount)}</TableCell>
        <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
          {formatDate(order.createdAt)}
        </TableCell>
        <TableCell onClick={(e) => e.stopPropagation()}>
          {nextStatus && (
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
          {order.status === "PENDING" && (
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

      {/* Expanded Row */}
      {expanded && (
        <TableRow>
          <TableCell colSpan={7} className="bg-muted/20 px-6 py-4">
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {order.deliveryAddress && (
                  <div>
                    <p className="font-medium text-muted-foreground mb-1">Delivery Address</p>
                    <p>
                      {order.deliveryAddress.regionType} — {order.deliveryAddress.cityType}
                    </p>
                    <p>
                      House {order.deliveryAddress.homeNumber}, Room {order.deliveryAddress.roomNumber}
                    </p>
                  </div>
                )}
                {order.note && (
                  <div>
                    <p className="font-medium text-muted-foreground mb-1">Note</p>
                    <p className="italic">{order.note}</p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="font-medium text-sm">Order Items</p>
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
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const { data, isLoading } = useOrders({
    status: statusFilter === "ALL" ? undefined : statusFilter,
    page,
    size: pageSize,
    sort: "createdAt,desc",
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader title="Orders" description={`${data?.totalElements ?? "..."} total orders`} />

      <Card>
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <Select
            value={statusFilter}
            onValueChange={(v) => { setStatusFilter(v as OrderStatus | "ALL"); setPage(0); }}
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
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="hidden lg:table-cell">Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-8 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                : data?.content.map((order) => (
                    <OrderRow key={order.id} order={order} />
                  ))}
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
              onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
