import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { BASE_URL } from "@/lib/api";

/**
 * Resolves an image URL returned by the backend.
 * - Absolute URLs (http/https/data:) → returned as-is
 * - Relative paths (/uploads/...) → prepended with BASE_URL
 * - null/undefined → null
 */
export function img(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http") || url.startsWith("//") || url.startsWith("data:")) return url;
  return `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "UZS"): string {
  return new Intl.NumberFormat("uz-UZ", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ` ${currency}`;
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

export function formatDateShort(dateString: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateString));
}

export function getInitials(name: string, surname?: string): string {
  const first = name?.charAt(0)?.toUpperCase() ?? "";
  const last = surname?.charAt(0)?.toUpperCase() ?? "";
  return (first + last) || (name?.slice(0, 2)?.toUpperCase() ?? "??");
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "…";
}
