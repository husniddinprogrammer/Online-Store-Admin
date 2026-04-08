"use client";

import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  className?: string;
  iconClassName?: string;
  index?: number;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  iconClassName,
  index = 0,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
    >
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold tracking-tight">{value}</p>
              {description && <p className="text-xs text-muted-foreground">{description}</p>}
              {trend && (
                <p
                  className={cn(
                    "text-xs font-medium",
                    trend.value >= 0 ? "text-success" : "text-destructive",
                  )}
                >
                  {trend.value >= 0 ? "+" : ""}
                  {trend.value}% {trend.label}
                </p>
              )}
            </div>
            <div className={cn("p-2.5 rounded-lg bg-primary/10", iconClassName)}>
              <Icon className="w-5 h-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
