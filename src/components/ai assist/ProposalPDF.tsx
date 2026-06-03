import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// ─── Font Registration ─────────────────────────────────────────────────────
// @react-pdf/renderer requires TTF/OTF format — WOFF/WOFF2 are not supported.
// Using @expo-google-fonts which packages Google Fonts as TTF files.
Font.register({
  family: "NotoSansHebrew",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/npm/@expo-google-fonts/noto-sans-hebrew/NotoSansHebrew_400Regular.ttf",
      fontWeight: 400,
    },
    {
      src: "https://cdn.jsdelivr.net/npm/@expo-google-fonts/noto-sans-hebrew/NotoSansHebrew_700Bold.ttf",
      fontWeight: 700,
    },
  ],
});

// ─── Types ────────────────────────────────────────────────────────────────
export interface ProposalData {
  projectTitle: string;
  clientName: string;
  companyName: string;
  generatedAt: string;
  language?: string;
  executiveSummary?: string;
  projectOverview?: string;
  scopeOfWork?: string[];
  approach?: string;
  timeline?: {
    totalDuration: string;
    phases: { phase: string; duration: string; description: string }[];
  };
  investment?: {
    totalBudget: string;
    breakdown: { item: string; amount: string; description: string }[];
  };
  whyUs?: string[];
  terms?: string[];
  nextSteps?: string[];
  rawContent?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────
const RTL_LANGUAGES = ["Hebrew", "Arabic", "Persian", "Urdu"];

const C = {
  headerBg: "#1e3a5f",
  blue: "#2e86c1",
  blueDark: "#1a5276",
  sectionBg: "#f0f4f8",
  border: "#d5e8f3",
  text: "#333333",
  textMuted: "#6b7280",
  white: "#ffffff",
  yellow: "#fffbeb",
  yellowBorder: "#f59e0b",
  yellowText: "#92400e",
  totalBg: "#1e3a5f",
};

// ─── Base Styles ──────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    paddingTop: 0,
    paddingBottom: 60,
    paddingHorizontal: 0,
    fontSize: 10,
    lineHeight: 1.6,
    color: C.text,
  },
  content: {
    paddingHorizontal: 40,
  },
  // ─── Header ───────────────────────────────────────────
  header: {
    backgroundColor: C.headerBg,
    paddingVertical: 32,
    paddingHorizontal: 40,
    marginBottom: 0,
  },
  headerTag: {
    fontSize: 8,
    color: "#93c5fd",
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: C.white,
    marginBottom: 6,
    lineHeight: 1.3,
  },
  // ─── Info Bar ──────────────────────────────────────────
  infoBar: {
    flexDirection: "row",
    backgroundColor: C.sectionBg,
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderBottom: `1 solid ${C.border}`,
    marginBottom: 20,
  },
  infoBarCell: {
    flex: 1,
    fontSize: 9,
    color: C.textMuted,
  },
  infoBarLabel: {
    fontWeight: "bold",
    color: C.blueDark,
  },
  infoBarDivider: {
    width: 1,
    backgroundColor: C.border,
    marginHorizontal: 12,
  },
  // ─── Confidential ──────────────────────────────────────
  confidential: {
    backgroundColor: C.yellow,
    border: `1 solid ${C.yellowBorder}`,
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 40,
    marginBottom: 20,
  },
  confidentialText: {
    fontSize: 8,
    color: C.yellowText,
    fontStyle: "italic",
  },
  // ─── Section ──────────────────────────────────────────
  section: {
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 6,
    borderBottom: `2 solid ${C.blue}`,
  },
  sectionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.blue,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: C.blue,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sectionText: {
    fontSize: 10,
    color: C.text,
    lineHeight: 1.7,
    backgroundColor: C.sectionBg,
    padding: 12,
    borderRadius: 4,
    border: `1 solid ${C.border}`,
  },
  // ─── Bullet items ─────────────────────────────────────
  bulletItem: {
    flexDirection: "row",
    marginBottom: 6,
    alignItems: "flex-start",
  },
  bulletCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: C.blue,
    marginRight: 8,
    marginTop: 1,
    flexShrink: 0,
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    color: C.text,
    lineHeight: 1.6,
  },
  // ─── Timeline ─────────────────────────────────────────
  tableHeader: {
    flexDirection: "row",
    backgroundColor: C.headerBg,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: "bold",
    color: C.white,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderBottom: `1 solid ${C.border}`,
    backgroundColor: C.white,
  },
  tableRowAlt: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderBottom: `1 solid ${C.border}`,
    backgroundColor: C.sectionBg,
  },
  tableCell: {
    fontSize: 9,
    color: C.text,
    lineHeight: 1.5,
  },
  durationBadge: {
    backgroundColor: C.blue,
    color: C.white,
    fontSize: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  // ─── Investment total ─────────────────────────────────
  investmentTotalRow: {
    flexDirection: "row",
    paddingVertical: 9,
    paddingHorizontal: 10,
    backgroundColor: C.totalBg,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  investmentTotalLabel: {
    flex: 2,
    fontSize: 10,
    fontWeight: "bold",
    color: C.white,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  investmentTotalValue: {
    flex: 1,
    fontSize: 10,
    fontWeight: "bold",
    color: C.white,
    textAlign: "right",
  },
  // ─── Why Us grid ──────────────────────────────────────
  whyUsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  whyUsCard: {
    width: "47%",
    backgroundColor: C.sectionBg,
    border: `1 solid ${C.border}`,
    borderLeft: `3 solid ${C.blue}`,
    borderRadius: 4,
    padding: 10,
    marginBottom: 8,
  },
  whyUsNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: C.blue,
    marginBottom: 4,
  },
  whyUsText: {
    fontSize: 9,
    color: C.text,
    lineHeight: 1.5,
  },
  // ─── Next Steps ───────────────────────────────────────
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: C.blue,
    color: C.white,
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
    marginRight: 10,
    paddingTop: 5,
    flexShrink: 0,
  },
  stepText: {
    flex: 1,
    fontSize: 10,
    color: C.text,
    lineHeight: 1.6,
  },
  // ─── Footer ───────────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    borderTop: `1 solid ${C.border}`,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 8,
    color: C.textMuted,
  },
});

// ─── Helpers ──────────────────────────────────────────────────────────────
const getFont = (isRTL: boolean, weight?: "bold") =>
  isRTL ? "NotoSansHebrew" : weight === "bold" ? "Helvetica-Bold" : "Helvetica";

const rtlText = (isRTL: boolean) =>
  isRTL ? { textAlign: "right" as const, direction: "rtl" as const } : {};

const rtlRow = (isRTL: boolean) =>
  isRTL ? { flexDirection: "row-reverse" as const } : {};

// ─── Sub-components ───────────────────────────────────────────────────────
const SectionHeader = ({
  title,
  isRTL,
  font,
}: {
  title: string;
  isRTL: boolean;
  font: string;
}) => (
  <View style={[styles.sectionHeader, isRTL ? { flexDirection: "row-reverse" } : {}]}>
    <View style={[styles.sectionDot, isRTL ? { marginRight: 0, marginLeft: 8 } : {}]} />
    <Text style={[styles.sectionTitle, { fontFamily: font }, rtlText(isRTL)]}>
      {title}
    </Text>
  </View>
);

// ─── Main Component ───────────────────────────────────────────────────────
export const ProposalPDF: React.FC<{ data: ProposalData }> = ({ data }) => {
  const isRTL = RTL_LANGUAGES.includes(data.language ?? "");
  const font = getFont(isRTL);
  const fontBold = getFont(isRTL, "bold");

  const formattedDate = data.generatedAt
    ? new Date(data.generatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString();

  const pageStyle = { ...styles.page, fontFamily: font };

  return (
    <Document>
      {/* ══ PAGE 1 ══════════════════════════════════════════════════════ */}
      <Page size="A4" style={pageStyle}>
        {/* Header */}
        <View style={[styles.header, isRTL ? { alignItems: "flex-end" } : {}]}>
          <Text style={[styles.headerTag, rtlText(isRTL)]}>
            Professional Proposal
          </Text>
          <Text style={[styles.headerTitle, { fontFamily: fontBold }, rtlText(isRTL)]}>
            {data.projectTitle}
          </Text>
        </View>

        {/* Info Bar */}
        <View style={[styles.infoBar, isRTL ? { flexDirection: "row-reverse" } : {}]}>
          <Text style={[styles.infoBarCell, rtlText(isRTL)]}>
            <Text style={[styles.infoBarLabel, { fontFamily: fontBold }]}>
              {isRTL ? "לקוח: " : "Prepared for: "}
            </Text>
            {data.clientName}
          </Text>
          <View style={styles.infoBarDivider} />
          <Text style={[styles.infoBarCell, rtlText(isRTL)]}>
            <Text style={[styles.infoBarLabel, { fontFamily: fontBold }]}>
              {isRTL ? "מאת: " : "By: "}
            </Text>
            {data.companyName}
          </Text>
          <View style={styles.infoBarDivider} />
          <Text style={[styles.infoBarCell, rtlText(isRTL)]}>
            <Text style={[styles.infoBarLabel, { fontFamily: fontBold }]}>
              {isRTL ? "תאריך: " : "Date: "}
            </Text>
            {formattedDate}
          </Text>
        </View>

        {/* Confidential Banner */}
        <View style={styles.confidential}>
          <Text style={[styles.confidentialText, rtlText(isRTL)]}>
            {isRTL
              ? `סודי — מסמך זה הוכן באופן בלעדי עבור ${data.clientName} ומכיל מידע קנייני.`
              : `CONFIDENTIAL — This document is prepared exclusively for ${data.clientName} and contains proprietary information.`}
          </Text>
        </View>

        {/* Executive Summary */}
        {data.executiveSummary && (
          <View style={styles.section}>
            <SectionHeader
              title={isRTL ? "סיכום מנהלים" : "Executive Summary"}
              isRTL={isRTL}
              font={fontBold}
            />
            <Text style={[styles.sectionText, { fontFamily: font }, rtlText(isRTL)]}>
              {data.executiveSummary}
            </Text>
          </View>
        )}

        {/* Project Overview */}
        {data.projectOverview && (
          <View style={styles.section}>
            <SectionHeader
              title={isRTL ? "סקירת הפרויקט" : "Project Overview"}
              isRTL={isRTL}
              font={fontBold}
            />
            <Text style={[styles.sectionText, { fontFamily: font }, rtlText(isRTL)]}>
              {data.projectOverview}
            </Text>
          </View>
        )}

        {/* Scope of Work */}
        {data.scopeOfWork && data.scopeOfWork.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title={isRTL ? "היקף העבודה" : "Scope of Work"}
              isRTL={isRTL}
              font={fontBold}
            />
            {data.scopeOfWork.map((item, i) => (
              <View key={i} style={[styles.bulletItem, rtlRow(isRTL)]}>
                <View style={[styles.bulletCircle, isRTL ? { marginRight: 0, marginLeft: 8 } : {}]} />
                <Text style={[styles.bulletText, { fontFamily: font }, rtlText(isRTL)]}>
                  {item}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Approach */}
        {data.approach && (
          <View style={styles.section}>
            <SectionHeader
              title={isRTL ? "מתודולוגיה וגישה" : "Methodology & Approach"}
              isRTL={isRTL}
              font={fontBold}
            />
            <Text style={[styles.sectionText, { fontFamily: font }, rtlText(isRTL)]}>
              {data.approach}
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} {data.companyName} — Powered by Flowlio AI
          </Text>
          <Text style={styles.footerText}>Confidential | {formattedDate}</Text>
        </View>
      </Page>

      {/* ══ PAGE 2 ══════════════════════════════════════════════════════ */}
      <Page size="A4" style={pageStyle}>
        {/* Timeline */}
        {data.timeline && (
          <View style={[styles.section, { paddingTop: 30 }]}>
            <SectionHeader
              title={isRTL ? "לוח זמנים לפרויקט" : "Project Timeline"}
              isRTL={isRTL}
              font={fontBold}
            />
            {/* Badge */}
            <View style={{ marginBottom: 10 }}>
              <Text style={styles.durationBadge}>
                {isRTL ? "משך כולל: " : "Total Duration: "}
                {data.timeline.totalDuration}
              </Text>
            </View>
            {/* Table */}
            <View style={[styles.tableHeader, rtlRow(isRTL)]}>
              <Text style={[styles.tableHeaderCell, { flex: 2 }, rtlText(isRTL)]}>
                {isRTL ? "שלב" : "Phase"}
              </Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }, rtlText(isRTL)]}>
                {isRTL ? "משך" : "Duration"}
              </Text>
              <Text style={[styles.tableHeaderCell, { flex: 3 }, rtlText(isRTL)]}>
                {isRTL ? "תיאור" : "Description"}
              </Text>
            </View>
            {data.timeline.phases?.map((phase, i) => (
              <View
                key={i}
                style={[i % 2 === 0 ? styles.tableRow : styles.tableRowAlt, rtlRow(isRTL)]}
              >
                <Text style={[styles.tableCell, { flex: 2, fontFamily: fontBold }, rtlText(isRTL)]}>
                  {phase.phase}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }, rtlText(isRTL)]}>
                  {phase.duration}
                </Text>
                <Text style={[styles.tableCell, { flex: 3 }, rtlText(isRTL)]}>
                  {phase.description}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Investment */}
        {data.investment && (
          <View style={styles.section}>
            <SectionHeader
              title={isRTL ? "השקעה ותמחור" : "Investment & Pricing"}
              isRTL={isRTL}
              font={fontBold}
            />
            <View style={[styles.tableHeader, rtlRow(isRTL)]}>
              <Text style={[styles.tableHeaderCell, { flex: 2 }, rtlText(isRTL)]}>
                {isRTL ? "פריט" : "Item"}
              </Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }, rtlText(isRTL)]}>
                {isRTL ? "סכום" : "Amount"}
              </Text>
              <Text style={[styles.tableHeaderCell, { flex: 2 }, rtlText(isRTL)]}>
                {isRTL ? "תיאור" : "Description"}
              </Text>
            </View>
            {data.investment.breakdown?.map((row, i) => (
              <View
                key={i}
                style={[i % 2 === 0 ? styles.tableRow : styles.tableRowAlt, rtlRow(isRTL)]}
              >
                <Text style={[styles.tableCell, { flex: 2, fontFamily: fontBold }, rtlText(isRTL)]}>
                  {row.item}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }, rtlText(isRTL)]}>
                  {row.amount}
                </Text>
                <Text style={[styles.tableCell, { flex: 2 }, rtlText(isRTL)]}>
                  {row.description}
                </Text>
              </View>
            ))}
            <View style={[styles.investmentTotalRow, rtlRow(isRTL)]}>
              <Text style={[styles.investmentTotalLabel, { fontFamily: fontBold }, rtlText(isRTL)]}>
                {isRTL ? "סה״כ השקעה" : "TOTAL INVESTMENT"}
              </Text>
              <Text style={[styles.investmentTotalValue, { fontFamily: fontBold }]}>
                {data.investment.totalBudget}
              </Text>
            </View>
          </View>
        )}

        {/* Why Us */}
        {data.whyUs && data.whyUs.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title={isRTL ? "למה לבחור בנו" : "Why Choose Us"}
              isRTL={isRTL}
              font={fontBold}
            />
            <View style={styles.whyUsGrid}>
              {data.whyUs.map((reason, i) => (
                <View key={i} style={[styles.whyUsCard, isRTL ? { borderLeft: 0, borderRight: `3 solid ${C.blue}` } : {}]}>
                  <Text style={[styles.whyUsNumber, { fontFamily: fontBold }]}>
                    0{i + 1}
                  </Text>
                  <Text style={[styles.whyUsText, { fontFamily: font }, rtlText(isRTL)]}>
                    {reason}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Terms */}
        {data.terms && data.terms.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title={isRTL ? "תנאים והגבלות" : "Terms & Conditions"}
              isRTL={isRTL}
              font={fontBold}
            />
            {data.terms.map((term, i) => (
              <View key={i} style={[styles.bulletItem, rtlRow(isRTL)]}>
                <View style={[styles.bulletCircle, isRTL ? { marginRight: 0, marginLeft: 8 } : {}]} />
                <Text style={[styles.bulletText, { fontFamily: font }, rtlText(isRTL)]}>
                  {term}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Next Steps */}
        {data.nextSteps && data.nextSteps.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title={isRTL ? "הצעדים הבאים" : "Next Steps"}
              isRTL={isRTL}
              font={fontBold}
            />
            {data.nextSteps.map((step, i) => (
              <View key={i} style={[styles.stepRow, rtlRow(isRTL)]}>
                <Text style={[styles.stepBadge, { fontFamily: fontBold }, isRTL ? { marginRight: 0, marginLeft: 10 } : {}]}>
                  {i + 1}
                </Text>
                <Text style={[styles.stepText, { fontFamily: font }, rtlText(isRTL)]}>
                  {step}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} {data.companyName} — Powered by Flowlio AI
          </Text>
          <Text style={styles.footerText}>Confidential | {formattedDate}</Text>
        </View>
      </Page>
    </Document>
  );
};
