/**
 * Company and legal data shown in the Privacy Policy, Terms of Service and cookie banner.
 *
 * FILL IN BEFORE PUBLISHING: every value marked with "[PREENCHER" must be replaced with the
 * real data of the company that operates Flowlio (LGPD art. 9 and 41 require it).
 *
 * LEGAL_VERSION is the date of the current Terms/Privacy text. Bump it whenever either
 * document changes materially: it is stored with each signup as proof of acceptance.
 */
export const LEGAL_VERSION = "2026-11-21";

export const LEGAL = {
  productName: "Flowlio",
  companyName: "[PREENCHER: razão social]",
  cnpj: "[PREENCHER: CNPJ]",
  address: "[PREENCHER: endereço completo da sede]",
  /** Channel for data subject requests (LGPD art. 18) and the Encarregado (DPO, art. 41). */
  privacyEmail: "[PREENCHER: privacidade@seudominio.com]",
  dpoName: "[PREENCHER: nome do Encarregado pelo tratamento de dados]",
  supportEmail: "info@dotvizion.com",
  /** City of the competent court for disputes (Terms of Service, governing law clause). */
  forumCity: "[PREENCHER: cidade/UF do foro]",
} as const;

/** Formats LEGAL_VERSION ("YYYY-MM-DD") for display without time zone shifts. */
export function legalVersionLabel(language: "pt" | "en") {
  const [year, month, day] = LEGAL_VERSION.split("-");
  return language === "pt" ? `${day}/${month}/${year}` : `${year}-${month}-${day}`;
}
