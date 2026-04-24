import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

export interface ProposalData {
  projectTitle: string;
  clientName: string;
  companyName: string;
  generatedAt: string;
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

const BRAND_COLOR = "#0c89af";
const BRAND_DARK = "#086f8e";
const LIGHT_BG = "#f0f9fb";
const BORDER_COLOR = "#d1ecf1";
const TEXT_DARK = "#1a2e3a";
const TEXT_MUTED = "#5a7080";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 40,
    fontSize: 10,
    lineHeight: 1.6,
    fontFamily: "Helvetica",
    color: TEXT_DARK,
  },
  // ─── Header ───────────────────────────────────────────
  header: {
    backgroundColor: BRAND_COLOR,
    padding: 30,
    marginBottom: 24,
    borderRadius: 4,
  },
  headerTag: {
    fontSize: 9,
    color: "#bde8f5",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  headerMeta: {
    fontSize: 9,
    color: "#d0eef8",
    marginTop: 2,
  },
  headerDate: {
    fontSize: 9,
    color: "#d0eef8",
  },
  // ─── Section ──────────────────────────────────────────
  section: {
    marginBottom: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    borderBottom: `1 solid ${BRAND_COLOR}`,
    paddingBottom: 4,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BRAND_COLOR,
    marginRight: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: BRAND_DARK,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionText: {
    fontSize: 10,
    color: TEXT_DARK,
    lineHeight: 1.7,
    backgroundColor: LIGHT_BG,
    padding: 10,
    borderRadius: 3,
    border: `1 solid ${BORDER_COLOR}`,
  },
  // ─── List Items ───────────────────────────────────────
  bulletItem: {
    flexDirection: "row",
    marginBottom: 5,
    alignItems: "flex-start",
  },
  bulletDot: {
    width: 14,
    fontSize: 10,
    color: BRAND_COLOR,
    fontWeight: "bold",
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    color: TEXT_DARK,
    lineHeight: 1.6,
  },
  // ─── Timeline ─────────────────────────────────────────
  timelineBadge: {
    backgroundColor: BRAND_COLOR,
    color: "#fff",
    fontSize: 9,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  phaseRow: {
    flexDirection: "row",
    marginBottom: 6,
    backgroundColor: LIGHT_BG,
    borderRadius: 4,
    padding: 8,
    border: `1 solid ${BORDER_COLOR}`,
  },
  phaseNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: BRAND_COLOR,
    color: "#fff",
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
    marginRight: 8,
    paddingTop: 5,
  },
  phaseContent: {
    flex: 1,
  },
  phaseName: {
    fontSize: 10,
    fontWeight: "bold",
    color: BRAND_DARK,
  },
  phaseDuration: {
    fontSize: 9,
    color: TEXT_MUTED,
    marginBottom: 2,
  },
  phaseDesc: {
    fontSize: 9,
    color: TEXT_DARK,
  },
  // ─── Investment ───────────────────────────────────────
  investmentHeader: {
    flexDirection: "row",
    backgroundColor: BRAND_COLOR,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 1,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  investmentHeaderCell: {
    flex: 1,
    fontSize: 9,
    fontWeight: "bold",
    color: "#fff",
  },
  investmentRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderBottom: `1 solid ${BORDER_COLOR}`,
    backgroundColor: "#fff",
  },
  investmentRowEven: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderBottom: `1 solid ${BORDER_COLOR}`,
    backgroundColor: LIGHT_BG,
  },
  investmentCell: {
    flex: 1,
    fontSize: 9,
    color: TEXT_DARK,
  },
  investmentTotalRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: BRAND_COLOR,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  investmentTotalLabel: {
    flex: 2,
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff",
  },
  investmentTotalValue: {
    flex: 1,
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "right",
  },
  // ─── Why Us Cards ─────────────────────────────────────
  whyUsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  whyUsCard: {
    width: "47%",
    backgroundColor: LIGHT_BG,
    border: `1 solid ${BORDER_COLOR}`,
    borderRadius: 4,
    padding: 8,
    marginBottom: 6,
  },
  whyUsNumber: {
    fontSize: 14,
    fontWeight: "bold",
    color: BRAND_COLOR,
    marginBottom: 3,
  },
  whyUsText: {
    fontSize: 9,
    color: TEXT_DARK,
    lineHeight: 1.5,
  },
  // ─── Next Steps ───────────────────────────────────────
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  stepBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: BRAND_COLOR,
    color: "#fff",
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
    marginRight: 8,
    paddingTop: 4,
  },
  stepText: {
    flex: 1,
    fontSize: 10,
    color: TEXT_DARK,
    lineHeight: 1.6,
  },
  // ─── Footer ───────────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: `1 solid ${BORDER_COLOR}`,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerLeft: {
    fontSize: 8,
    color: TEXT_MUTED,
  },
  footerRight: {
    fontSize: 8,
    color: TEXT_MUTED,
  },
  // ─── Confidential banner ──────────────────────────────
  confidential: {
    backgroundColor: "#fff3cd",
    border: `1 solid #ffc107`,
    borderRadius: 3,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  confidentialText: {
    fontSize: 8,
    color: "#856404",
  },
});

// ─── Reusable SectionHeader ───────────────────────────────────
const SectionHeader = ({ title }: { title: string }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionDot} />
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

// ─── Main PDF Component ───────────────────────────────────────
export const ProposalPDF: React.FC<{ data: ProposalData }> = ({ data }) => {
  const formattedDate = data.generatedAt
    ? new Date(data.generatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.headerTag}>Professional Proposal</Text>
          <Text style={styles.headerTitle}>{data.projectTitle}</Text>
          <Text style={styles.headerMeta}>
            Prepared for: {data.clientName}
          </Text>
          <Text style={styles.headerMeta}>By: {data.companyName}</Text>
          <Text style={styles.headerDate}>Generated: {formattedDate}</Text>
        </View>

        {/* ── Confidential Banner ── */}
        <View style={styles.confidential}>
          <Text style={styles.confidentialText}>
            CONFIDENTIAL — This document is prepared exclusively for{" "}
            {data.clientName} and contains proprietary information.
          </Text>
        </View>

        {/* ── Executive Summary ── */}
        {data.executiveSummary && (
          <View style={styles.section}>
            <SectionHeader title="Executive Summary" />
            <Text style={styles.sectionText}>{data.executiveSummary}</Text>
          </View>
        )}

        {/* ── Project Overview ── */}
        {data.projectOverview && (
          <View style={styles.section}>
            <SectionHeader title="Project Overview" />
            <Text style={styles.sectionText}>{data.projectOverview}</Text>
          </View>
        )}

        {/* ── Scope of Work ── */}
        {data.scopeOfWork && data.scopeOfWork.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Scope of Work" />
            {data.scopeOfWork.map((item, i) => (
              <View key={i} style={styles.bulletItem}>
                <Text style={styles.bulletDot}>-</Text>
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Our Approach ── */}
        {data.approach && (
          <View style={styles.section}>
            <SectionHeader title="Our Approach & Methodology" />
            <Text style={styles.sectionText}>{data.approach}</Text>
          </View>
        )}
      </Page>

      {/* ── PAGE 2 ── */}
      <Page size="A4" style={styles.page}>
        {/* ── Timeline ── */}
        {data.timeline && (
          <View style={styles.section}>
            <SectionHeader title="Project Timeline" />
            <Text style={styles.timelineBadge}>
              Total Duration: {data.timeline.totalDuration}
            </Text>
            {data.timeline.phases?.map((phase, i) => (
              <View key={i} style={styles.phaseRow}>
                <Text style={styles.phaseNumber}>{i + 1}</Text>
                <View style={styles.phaseContent}>
                  <Text style={styles.phaseName}>{phase.phase}</Text>
                  <Text style={styles.phaseDuration}>
                    {phase.duration}
                  </Text>
                  <Text style={styles.phaseDesc}>{phase.description}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── Investment ── */}
        {data.investment && (
          <View style={styles.section}>
            <SectionHeader title="Investment & Pricing" />
            {/* Table header */}
            <View style={styles.investmentHeader}>
              <Text style={{ ...styles.investmentHeaderCell, flex: 2 }}>
                Item
              </Text>
              <Text style={styles.investmentHeaderCell}>Amount</Text>
              <Text style={{ ...styles.investmentHeaderCell, flex: 2 }}>
                Description
              </Text>
            </View>
            {data.investment.breakdown?.map((row, i) => (
              <View
                key={i}
                style={
                  i % 2 === 0 ? styles.investmentRow : styles.investmentRowEven
                }
              >
                <Text style={{ ...styles.investmentCell, flex: 2 }}>
                  {row.item}
                </Text>
                <Text style={styles.investmentCell}>{row.amount}</Text>
                <Text style={{ ...styles.investmentCell, flex: 2 }}>
                  {row.description}
                </Text>
              </View>
            ))}
            <View style={styles.investmentTotalRow}>
              <Text style={styles.investmentTotalLabel}>
                TOTAL INVESTMENT
              </Text>
              <Text style={styles.investmentTotalValue}>
                {data.investment.totalBudget}
              </Text>
            </View>
          </View>
        )}

        {/* ── Why Choose Us ── */}
        {data.whyUs && data.whyUs.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Why Choose Us" />
            <View style={styles.whyUsGrid}>
              {data.whyUs.map((reason, i) => (
                <View key={i} style={styles.whyUsCard}>
                  <Text style={styles.whyUsNumber}>0{i + 1}</Text>
                  <Text style={styles.whyUsText}>{reason}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Terms ── */}
        {data.terms && data.terms.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Terms & Conditions" />
            {data.terms.map((term, i) => (
              <View key={i} style={styles.bulletItem}>
                <Text style={styles.bulletDot}>-</Text>
                <Text style={styles.bulletText}>{term}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Next Steps ── */}
        {data.nextSteps && data.nextSteps.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Next Steps" />
            {data.nextSteps.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <Text style={styles.stepBadge}>{i + 1}</Text>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Text style={styles.footerLeft}>
            © {new Date().getFullYear()} {data.companyName} — Powered by
            Flowlio AI
          </Text>
          <Text style={styles.footerRight}>
            Confidential | {formattedDate}
          </Text>
        </View>
      </Page>
    </Document>
  );
};
