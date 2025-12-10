import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translation files
import enTranslations from "../locales/en.json";
import esTranslations from "../locales/es.json";
import ptTranslations from "../locales/pt.json";
import heTranslations from "../locales/he.json";

const resources = {
  en: {
    translation: enTranslations,
  },
  es: {
    translation: esTranslations,
  },
  pt: {
    translation: ptTranslations,
  },
  he: {
    translation: heTranslations,
  },
};

const savedLanguage = localStorage.getItem("i18nextLng") || "en";

i18n
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources,
    fallbackLng: "en", // Default language
    lng: savedLanguage, // Get saved language or default to English
    debug: false,
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

// Set initial HTML attributes for RTL support
// Only set dir for Hebrew, others use default LTR
if (typeof document !== "undefined") {
  if (savedLanguage === "he") {
    document.documentElement.setAttribute("dir", "rtl");
    document.documentElement.setAttribute("lang", "he");
    document.body.setAttribute("dir", "rtl");
  } else {
    document.documentElement.setAttribute("dir", "ltr");
    document.documentElement.setAttribute("lang", savedLanguage);
    document.body.setAttribute("dir", "ltr");
  }
}

export default i18n;
