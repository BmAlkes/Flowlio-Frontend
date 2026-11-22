import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Stack } from "@/components/ui/stack";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/user section/navbar/navbar";
import { Footer } from "@/components/footer/footer";

export type LegalLanguage = "pt" | "en";

export interface LegalSection {
  title: string;
  body?: string[];
  bullets?: string[];
  table?: { head: string[]; rows: string[][] };
  links?: { label: string; href: string }[];
  subsections?: LegalSection[];
}

export interface LegalDoc {
  title: string;
  updated: string;
  intro?: string[];
  sections: LegalSection[];
}

/** Portuguese is the authoritative text (LGPD); every other app language reads the English one. */
export function useLegalLanguage() {
  const { i18n } = useTranslation();
  const initial: LegalLanguage = (i18n.resolvedLanguage || i18n.language || "en").startsWith("pt") ? "pt" : "en";
  return useState<LegalLanguage>(initial);
}

function Section({ section, level }: { section: LegalSection; level: 2 | 3 }) {
  const Heading = level === 2 ? "h2" : "h3";
  return (
    <Box className={level === 3 ? "mb-4" : undefined}>
      <Heading className={level === 2 ? "text-xl font-semibold text-indigo-800 mb-4" : "text-lg font-medium text-indigo-700 mb-2"}>
        {section.title}
      </Heading>
      {section.body?.map((paragraph, index) => (
        <p key={index} className="text-foreground leading-relaxed mb-2">{paragraph}</p>
      ))}
      {section.bullets && (
        <ul className="list-disc ps-6 text-foreground space-y-1 mb-2">
          {section.bullets.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
      )}
      {section.table && (
        <Box className="my-3 border border-border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-indigo-50">
                {section.table.head.map(cell => (
                  <th key={cell} className="text-start px-3 py-2 font-medium text-indigo-800">{cell}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {section.table.rows.map((row, index) => (
                <tr key={index}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className={"px-3 py-2 align-top" + (cellIndex === 0 ? " font-medium" : "")}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      )}
      {section.links && (
        <ul className="ps-6 list-disc text-foreground space-y-1 mb-2">
          {section.links.map(link => (
            <li key={link.href}>
              <a href={link.href} target="_blank" rel="noreferrer" className="underline text-indigo-700">{link.label}</a>
            </li>
          ))}
        </ul>
      )}
      {section.subsections?.map(sub => <Section key={sub.title} section={sub} level={3} />)}
    </Box>
  );
}

export function LegalDocumentPage({ documents }: { documents: Record<LegalLanguage, LegalDoc> }) {
  const [language, setLanguage] = useLegalLanguage();
  const doc = documents[language];

  useEffect(() => {
    scrollTo(0, 0);
  }, []);
  useEffect(() => {
    document.title = `${doc.title} - Flowlio`;
  }, [doc.title]);

  return (
    <Box className="min-h-screen bg-gradient-to-l from-indigo-500/5 via-slate-50 to-indigo-50">
      <Navbar />
      <Box className="max-w-4xl mx-auto py-8 px-4">
        <Card className="p-5 sm:p-8 shadow-lg">
          <Stack className="space-y-6">
            <Flex className="justify-end gap-1" role="group" aria-label="Idioma / Language">
              {(["pt", "en"] as const).map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setLanguage(option)}
                  aria-pressed={language === option}
                  className={"px-3 py-1 rounded-full text-sm border cursor-pointer " + (language === option ? "bg-indigo-600 text-white border-indigo-600" : "border-border text-muted-foreground hover:text-foreground")}
                >
                  {option === "pt" ? "Português" : "English"}
                </button>
              ))}
            </Flex>
            <Flex className="flex-col items-center text-center mb-4">
              <h1 className="text-3xl font-bold text-indigo-900 mb-2">{doc.title}</h1>
              <p className="text-muted-foreground">{doc.updated}</p>
            </Flex>
            {doc.intro?.map((paragraph, index) => (
              <p key={index} className="text-foreground leading-relaxed">{paragraph}</p>
            ))}
            <Separator />
            {doc.sections.map(section => <Section key={section.title} section={section} level={2} />)}
            <Separator />
            <Flex className="justify-center pt-4">
              <p className="text-muted-foreground text-sm">© {new Date().getFullYear()} Flowlio.</p>
            </Flex>
          </Stack>
        </Card>
      </Box>
      <Footer />
    </Box>
  );
}
