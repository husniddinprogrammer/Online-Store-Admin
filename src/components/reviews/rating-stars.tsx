"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  value: number;
  onChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
  className?: string;
}

const SIZE_CLS = {
  sm: "h-3.5 w-3.5",
  md: "h-[18px] w-[18px]",
  lg: "h-[22px] w-[22px]",
};

const LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

export function RatingStars({
  value,
  onChange,
  size = "md",
  readonly = false,
  className,
}: RatingStarsProps) {
  const [hovered, setHovered] = useState(0);
  const effective = readonly ? value : hovered || value;
  const iconCls = SIZE_CLS[size];

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div
        className="flex items-center gap-0.5"
        onMouseLeave={() => !readonly && setHovered(0)}
        role={readonly ? undefined : "radiogroup"}
        aria-label={readonly ? `Rating: ${value} out of 5` : "Select rating"}
      >
        {Array.from({ length: 5 }, (_, i) => {
          const star = i + 1;
          const filled = star <= effective;
          return (
            <button
              key={star}
              type="button"
              disabled={readonly}
              onClick={() => !readonly && onChange?.(star)}
              onMouseEnter={() => !readonly && setHovered(star)}
              className={cn(
                "transition-transform duration-100",
                !readonly && "hover:scale-110 cursor-pointer",
                readonly && "cursor-default pointer-events-none",
              )}
            >
              <Star
                className={cn(
                  iconCls,
                  "transition-colors duration-100",
                  filled ? "text-amber-400 fill-amber-400" : "text-muted-foreground/40",
                )}
              />
            </button>
          );
        })}
      </div>
      {!readonly && effective > 0 && (
        <span className="text-xs text-muted-foreground ml-1 w-20 leading-none">
          {LABELS[effective]}
        </span>
      )}
    </div>
  );
}
