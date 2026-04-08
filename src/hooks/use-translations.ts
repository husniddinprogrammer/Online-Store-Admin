"use client";

import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "@/lib/i18n";

export function useTranslations(): TFunction {
  const { t } = useTranslation();

  return useCallback(
    (key: string, params?: Record<string, string | number>) => {
      const translated = t(key, { ...params, defaultValue: key });
      return typeof translated === "string" ? translated : key;
    },
    [t],
  );
}
