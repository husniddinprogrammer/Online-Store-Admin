"use client";

import { useAuthStore } from "@/store/auth.store";

/** Returns false for VIEWER role — use to gate all mutating actions (POST/PUT/DELETE). */
export function useCanEdit(): boolean {
  return useAuthStore((s) => s.user?.role !== "VIEWER");
}
