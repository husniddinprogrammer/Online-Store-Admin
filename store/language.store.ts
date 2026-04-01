import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Locale } from "@/lib/i18n";

function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "en";
  const lang = navigator.language;
  if (lang.startsWith("ru")) return "ru";
  if (lang === "uz-Cyrl" || lang.startsWith("uz-Cyrl")) return "uz-Cyrl";
  if (lang.startsWith("uz")) return "uz";
  return "en";
}

interface LanguageState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      locale: detectLocale(),
      setLocale: (locale) => set({ locale }),
    }),
    { name: "locale" }
  )
);
