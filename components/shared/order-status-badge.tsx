import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/types";

const statusConfig: Record<OrderStatus, { label: string; variant: "success" | "warning" | "info" | "destructive" | "secondary" | "muted" }> = {
  PENDING: { label: "Pending", variant: "warning" },
  PAID: { label: "Paid", variant: "info" },
  SHIPPED: { label: "Shipped", variant: "secondary" },
  DELIVERED: { label: "Delivered", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = statusConfig[status] ?? { label: status, variant: "muted" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
