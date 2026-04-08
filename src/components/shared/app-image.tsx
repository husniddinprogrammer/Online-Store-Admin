import type { ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface AppImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fill?: boolean;
}

export function AppImage({
  alt,
  className,
  fill = false,
  decoding = "async",
  loading = "lazy",
  ...props
}: AppImageProps) {
  return (
    <img
      alt={alt}
      decoding={decoding}
      loading={loading}
      className={cn(fill && "absolute inset-0 h-full w-full", className)}
      {...props}
    />
  );
}
