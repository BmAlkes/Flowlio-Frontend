import { LegalDocumentPage } from "@/components/legal/LegalDocument";
import { termsPt } from "@/data/legal/terms.pt";
import { termsEn } from "@/data/legal/terms.en";

const TermsOfServicePage = () => <LegalDocumentPage documents={{ pt: termsPt, en: termsEn }} />;

export default TermsOfServicePage;
