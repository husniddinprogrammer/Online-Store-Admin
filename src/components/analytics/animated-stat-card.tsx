"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Count-up hook ────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1100): number {
  const [count, setCount] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    if (isNaN(target)) return;
    const from = prev.current;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.round(from + (target - from) * eased));
      if (progress < 1) requestAnimationFrame(tick);
      else prev.current = target;
    };

    requestAnimationFrame(tick);
  }, [target, duration]);

  return count;
}

// ─── Color variants ───────────────────────────────────────────────────────────

export type StatAccentColor = "emerald" | "blue" | "orange" | "purple" | "cyan" | "pink";

const ACCENT: Record<StatAccentColor, { gradient: string; iconBg: string; iconColor: string }> = {
  emerald: {
    gradient: "from-card to-emerald-50/70 dark:to-emerald-950/25",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  blue: {
    gradient: "from-card to-blue-50/70 dark:to-blue-950/25",
    iconBg: "bg-blue-100 dark:bg-blue-900/50",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  orange: {
    gradient: "from-card to-orange-50/70 dark:to-orange-950/25",
    iconBg: "bg-orange-100 dark:bg-orange-900/50",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
  purple: {
    gradient: "from-card to-purple-50/70 dark:to-purple-950/25",
    iconBg: "bg-purple-100 dark:bg-purple-900/50",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  cyan: {
    gradient: "from-card to-cyan-50/70 dark:to-cyan-950/25",
    iconBg: "bg-cyan-100 dark:bg-cyan-900/50",
    iconColor: "text-cyan-600 dark:text-cyan-400",
  },
  pink: {
    gradient: "from-card to-pink-50/70 dark:to-pink-950/25",
    iconBg: "bg-pink-100 dark:bg-pink-900/50",
    iconColor: "text-pink-600 dark:text-pink-400",
  },
};

// ─── Props ────────────────────────────────────────────────────────────────────

export interface AnimatedStatCardProps {
  title: string;
  value: number;
  format?: (n: number) => string;
  icon: LucideIcon;
  color?: StatAccentColor;
  index?: number;
  isLoading?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AnimatedStatCard({
  title,
  value,
  format,
  icon: Icon,
  color = "blue",
  index = 0,
  isLoading = false,
}: AnimatedStatCardProps) {
  const animated = useCountUp(value);
  const display = format ? format(animated) : animated.toLocaleString();
  const accent = ACCENT[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: index * 0.07 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
      className="h-[130px]"
    >
      <div
        className={cn(
          "h-full rounded-2xl border border-border shadow-md",
          "bg-gradient-to-br",
          accent.gradient,
          "flex flex-col justify-between p-5",
          "transition-shadow duration-200 hover:shadow-lg",
        )}
      >
        {/* Top row — icon circle + title */}
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
              accent.iconBg,
            )}
          >
            <Icon className={cn("h-4 w-4", accent.iconColor)} />
          </div>
          <p className="text-sm font-medium text-muted-foreground leading-tight">{title}</p>
        </div>

        {/* Bottom — animated value */}
        {isLoading ? (
          <div className="h-7 w-28 rounded-lg bg-muted/60 animate-pulse" />
        ) : (
          <p className="text-2xl font-bold tracking-tight tabular-nums text-foreground leading-none">
            {display}
          </p>
        )}
      </div>
    </motion.div>
  );
}
