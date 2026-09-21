import heCore from "../locales/core/he.json";
import enProposalConversion from "../locales/proposal-conversion/en.json";
import ptProposalConversion from "../locales/proposal-conversion/pt.json";
import esProposalConversion from "../locales/proposal-conversion/es.json";
import heProposalConversion from "../locales/proposal-conversion/he.json";
import esCore from "../locales/core/es.json";
import ptCore from "../locales/core/pt.json";
import enCore from "../locales/core/en.json";
import heOperations from "../locales/operations/he.json";
import esOperations from "../locales/operations/es.json";
import ptOperations from "../locales/operations/pt.json";
import enOperations from "../locales/operations/en.json";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translation files
import enTranslations from "../locales/en.json";
import esTranslations from "../locales/es.json";
import ptTranslations from "../locales/pt.json";
import heTranslations from "../locales/he.json";
import enClientDetail from "../locales/client-detail/en.json";
import ptClientDetail from "../locales/client-detail/pt.json";
import esClientDetail from "../locales/client-detail/es.json";
import heClientDetail from "../locales/client-detail/he.json";

const resources = {
  en: {
    translation: { ...enTranslations, clientDetail: enClientDetail, operations: enOperations, core: enCore, proposalConversion: enProposalConversion },
  },
  es: {
    translation: { ...esTranslations, clientDetail: esClientDetail, operations: esOperations, core: esCore, proposalConversion: esProposalConversion },
  },
  pt: {
    translation: { ...ptTranslations, clientDetail: ptClientDetail, operations: ptOperations, core: ptCore, proposalConversion: ptProposalConversion },
  },
  he: {
    translation: { ...heTranslations, clientDetail: heClientDetail, operations: heOperations, core: heCore, proposalConversion: heProposalConversion },
  },
};

function readLanguagePreference() {
  try { return window.localStorage.getItem("i18nextLng") || "en"; }
  catch { return "en"; }
}
const savedLanguage = readLanguagePreference();

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

function synchronizeDocumentLanguage() {
  const language = i18n.resolvedLanguage || "en";
  const direction = i18n.dir(language);
  document.documentElement.lang = language;
  document.documentElement.dir = direction;
  document.body.dir = direction;
}
synchronizeDocumentLanguage();
i18n.on("languageChanged", synchronizeDocumentLanguage);

export default i18n;
