import { describe, expect, it } from "vitest";
import { privacyPt } from "./privacy.pt";
import { privacyEn } from "./privacy.en";
import { termsPt } from "./terms.pt";
import { termsEn } from "./terms.en";
import { LEGAL_VERSION } from "@/configs/legal.config";
import type { LegalDoc } from "@/components/legal/LegalDocument";

const text = (doc: LegalDoc) => JSON.stringify(doc);

describe("legal documents", () => {
  it("Portuguese and English versions keep the same structure", () => {
    for (const [pt, en] of [[privacyPt, privacyEn], [termsPt, termsEn]]) {
      expect(en.sections.length).toBe(pt.sections.length);
      pt.sections.forEach((section, index) => {
        expect(en.sections[index].table?.rows.length).toBe(section.table?.rows.length);
        expect(en.sections[index].subsections?.length).toBe(section.subsections?.length);
      });
    }
  });

  it("the privacy policy covers what LGPD requires", () => {
    const policy = text(privacyPt);
    for (const required of ["Encarregado", "art. 18", "art. 33", "Base legal", "OpenAI", "Marco Civil", "ANPD", "15 dias"]) {
      expect(policy).toContain(required);
    }
  });

  it("the terms use Brazilian law and no compulsory arbitration", () => {
    expect(text(termsPt)).toContain("República Federativa do Brasil");
    expect(text(termsPt)).toContain("art. 39");
    expect(text(termsEn).toLowerCase()).not.toContain("binding arbitration");
  });

  it("the version is a fixed date, not today's date", () => {
    expect(LEGAL_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const [year, month, day] = LEGAL_VERSION.split("-");
    expect(privacyPt.updated).toContain(`${day}/${month}/${year}`);
  });
});
