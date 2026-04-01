import enMessages from "@/messages/en.json";
import ruMessages from "@/messages/ru.json";
import uzMessages from "@/messages/uz.json";
import uzCyrlMessages from "@/messages/uz-Cyrl.json";

export type Locale = "en" | "ru" | "uz" | "uz-Cyrl";

export const LOCALES: { value: Locale; nativeLabel: string; flag: string }[] = [
  { value: "en", nativeLabel: "English", flag: "🇺🇸" },
  { value: "ru", nativeLabel: "Русский", flag: "🇷🇺" },
  { value: "uz", nativeLabel: "O'zbek", flag: "🇺🇿" },
  { value: "uz-Cyrl", nativeLabel: "Ўзбек", flag: "🇺🇿" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Messages = Record<string, any>;

export const ALL_MESSAGES: Record<Locale, Messages> = {
  en: enMessages,
  ru: ruMessages,
  uz: uzMessages,
  "uz-Cyrl": uzCyrlMessages,
};

// Resolve a dotted key like "nav.dashboard" against a nested object
function resolve(obj: Messages, key: string, params?: Record<string, string | number>): string {
  const parts = key.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cur: any = obj;
  for (const part of parts) {
    if (cur == null || typeof cur !== "object") return key;
    cur = cur[part];
  }
  if (typeof cur !== "string") return key;
  if (!params) return cur;
  return cur.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`));
}

export type TFunction = (key: string, params?: Record<string, string | number>) => string;

export function createTranslator(messages: Messages): TFunction {
  return (key: string, params?: Record<string, string | number>) => resolve(messages, key, params);
}
