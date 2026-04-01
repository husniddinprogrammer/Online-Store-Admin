"use client";

import { useMemo } from "react";
import { useLanguageStore } from "@/store/language.store";
import { ALL_MESSAGES, createTranslator, type TFunction } from "@/lib/i18n";

export function useTranslations(): TFunction {
  const locale = useLanguageStore((s) => s.locale);
  return useMemo(() => createTranslator(ALL_MESSAGES[locale] ?? ALL_MESSAGES.en), [locale]);
}
