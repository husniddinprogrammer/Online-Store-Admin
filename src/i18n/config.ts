import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { ALL_MESSAGES } from "@/utils/i18n";

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: ALL_MESSAGES.en },
    ru: { translation: ALL_MESSAGES.ru },
    uz: { translation: ALL_MESSAGES.uz },
    "uz-Cyrl": { translation: ALL_MESSAGES["uz-Cyrl"] },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
});

export default i18n;
