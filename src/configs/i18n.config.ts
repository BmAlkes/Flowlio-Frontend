import heAttention from "../locales/attention/he.json";
import heLeadsLayout from "../locales/leads-layout/he.json";
import esAttention from "../locales/attention/es.json";
import esLeadsLayout from "../locales/leads-layout/es.json";
import ptAttention from "../locales/attention/pt.json";
import ptLeadsLayout from "../locales/leads-layout/pt.json";
import enAttention from "../locales/attention/en.json";
import enLeadsLayout from "../locales/leads-layout/en.json";
import enProjectView from "../locales/project-view/en.json";
import ptProjectView from "../locales/project-view/pt.json";
import esProjectView from "../locales/project-view/es.json";
import heProjectView from "../locales/project-view/he.json";
import heCoreOnboarding from "../locales/core-onboarding/he.json";
import esCoreOnboarding from "../locales/core-onboarding/es.json";
import ptCoreOnboarding from "../locales/core-onboarding/pt.json";
import enCoreOnboarding from "../locales/core-onboarding/en.json";
import heWorkflows from "../locales/workflows/he.json";
import esWorkflows from "../locales/workflows/es.json";
import ptWorkflows from "../locales/workflows/pt.json";
import enWorkflows from "../locales/workflows/en.json";
import heCapacity from "../locales/capacity/he.json";
import esCapacity from "../locales/capacity/es.json";
import ptCapacity from "../locales/capacity/pt.json";
import enCapacity from "../locales/capacity/en.json";
import heDelivery from "../locales/delivery/he.json";
import esDelivery from "../locales/delivery/es.json";
import ptDelivery from "../locales/delivery/pt.json";
import enDelivery from "../locales/delivery/en.json";
import heProfitability from "../locales/profitability/he.json";
import esProfitability from "../locales/profitability/es.json";
import ptProfitability from "../locales/profitability/pt.json";
import enProfitability from "../locales/profitability/en.json";
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
    // Project detail labels are kept separate from the legacy project forms.
    translation: { ...enTranslations, attention: enAttention, leadsLayout: enLeadsLayout, projectView: enProjectView, clientDetail: enClientDetail, operations: enOperations, core: enCore, proposalConversion: enProposalConversion, profitability: enProfitability, delivery: enDelivery, capacity: enCapacity, workflows: enWorkflows, coreOnboarding: enCoreOnboarding, appSidebar: { ...enTranslations.appSidebar, attention: enAttention.title, teamCapacity: enCapacity.title, workflows: enWorkflows.title } },
  },
  es: {
    translation: { ...esTranslations, attention: esAttention, leadsLayout: esLeadsLayout, projectView: esProjectView, clientDetail: esClientDetail, operations: esOperations, core: esCore, proposalConversion: esProposalConversion, profitability: esProfitability, delivery: esDelivery, capacity: esCapacity, workflows: esWorkflows, coreOnboarding: esCoreOnboarding, appSidebar: { ...esTranslations.appSidebar, attention: esAttention.title, teamCapacity: esCapacity.title, workflows: esWorkflows.title } },
  },
  pt: {
    translation: { ...ptTranslations, attention: ptAttention, leadsLayout: ptLeadsLayout, projectView: ptProjectView, clientDetail: ptClientDetail, operations: ptOperations, core: ptCore, proposalConversion: ptProposalConversion, profitability: ptProfitability, delivery: ptDelivery, capacity: ptCapacity, workflows: ptWorkflows, coreOnboarding: ptCoreOnboarding, appSidebar: { ...ptTranslations.appSidebar, attention: ptAttention.title, teamCapacity: ptCapacity.title, workflows: ptWorkflows.title } },
  },
  he: {
    translation: { ...heTranslations, attention: heAttention, leadsLayout: heLeadsLayout, projectView: heProjectView, clientDetail: heClientDetail, operations: heOperations, core: heCore, proposalConversion: heProposalConversion, profitability: heProfitability, delivery: heDelivery, capacity: heCapacity, workflows: heWorkflows, coreOnboarding: heCoreOnboarding, appSidebar: { ...heTranslations.appSidebar, attention: heAttention.title, teamCapacity: heCapacity.title, workflows: heWorkflows.title } },
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
