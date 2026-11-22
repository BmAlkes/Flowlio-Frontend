import { LegalDocumentPage } from "@/components/legal/LegalDocument";
import { privacyPt } from "@/data/legal/privacy.pt";
import { privacyEn } from "@/data/legal/privacy.en";

const PrivacyPolicyPage = () => <LegalDocumentPage documents={{ pt: privacyPt, en: privacyEn }} />;

export default PrivacyPolicyPage;
