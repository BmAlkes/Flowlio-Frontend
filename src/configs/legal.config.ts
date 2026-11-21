/**
 * Company and legal data shown in the Privacy Policy, Terms of Service and cookie banner.
 *
 * LEGAL_VERSION is the date of the current Terms/Privacy text. Bump it whenever either
 * document changes materially: it is stored with each signup as proof of acceptance.
 */
export const LEGAL_VERSION = "2026-11-21";

export const LEGAL = {
  productName: "Flowlio",
  /** Flowlio is a product of Dotvizion (exempt business, no CNPJ). */
  companyName: "Dotvizion",
  /** Channel for data subject requests (LGPD art. 18) and privacy contact (art. 41). */
  privacyEmail: "info@dotvizion.com",
  supportEmail: "info@dotvizion.com",
  /** Dotvizion WhatsApp in international format, digits only (e.g. "972501234567"). Empty = not shown. */
  whatsapp: "",
} as const;

/** Contact line used by the legal documents: email, plus WhatsApp when configured. */
export function legalContact(language: "pt" | "en") {
  if (!LEGAL.whatsapp) return LEGAL.privacyEmail;
  const or = language === "pt" ? "ou WhatsApp" : "or WhatsApp";
  return `${LEGAL.privacyEmail} ${or} +${LEGAL.whatsapp} (wa.me/${LEGAL.whatsapp})`;
}

/** Formats LEGAL_VERSION ("YYYY-MM-DD") for display without time zone shifts. */
export function legalVersionLabel(language: "pt" | "en") {
  const [year, month, day] = LEGAL_VERSION.split("-");
  return language === "pt" ? `${day}/${month}/${year}` : `${year}-${month}-${day}`;
}
