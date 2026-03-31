"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { TopSellingProduct } from "@/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface TopProductsTableProps {
  data: TopSellingProduct[] | undefined;
  isLoading: boolean;
}

// ─── Medal colors for top 3 ───────────────────────────────────────────────────

const MEDAL_COLORS = [
  "text-yellow-500",  // 🥇
  "text-slate-400",   // 🥈
  "text-orange-400",  // 🥉
];

// ─── Component ────────────────────────────────────────────────────────────────

export function TopProductsTable({ data, isLoading }: TopProductsTableProps) {
  const maxRevenue = data?.[0]?.revenue ?? 1;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-4 w-4 text-primary" />
          Top Selling Products
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 pl-6">#</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Units Sold</TableHead>
              <TableHead className="text-right pr-6">Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 4 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full rounded" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : !data?.length
                ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-10">
                      No product data for this period
                    </TableCell>
                  </TableRow>
                )
                : data.map((product, i) => (
                  <motion.tr
                    key={product.productId}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    {/* Rank */}
                    <TableCell className="pl-6 font-medium tabular-nums">
                      <span className={cn("font-bold", MEDAL_COLORS[i] ?? "text-muted-foreground")}>
                        {i + 1}
                      </span>
                    </TableCell>

                    {/* Name + revenue bar */}
                    <TableCell>
                      <div className="space-y-1.5">
                        <span className="text-sm font-medium leading-none">{product.name}</span>
                        {/* Proportional revenue bar */}
                        <div className="h-1 w-full max-w-[200px] rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-700"
                            style={{ width: `${(product.revenue / maxRevenue) * 100}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>

                    {/* Units sold */}
                    <TableCell className="text-right tabular-nums font-medium">
                      {product.totalSold.toLocaleString()}
                    </TableCell>

                    {/* Revenue */}
                    <TableCell className="text-right pr-6 tabular-nums">
                      <span className="font-semibold">{product.revenue.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground ml-1">UZS</span>
                    </TableCell>
                  </motion.tr>
                ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
