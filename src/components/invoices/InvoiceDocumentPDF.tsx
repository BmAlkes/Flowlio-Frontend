import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    padding: 48,
    fontSize: 10,
    lineHeight: 1.5,
    fontFamily: "Helvetica",
    color: "#1f2937",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 36,
  },
  brand: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1797b9",
  },
  invoiceTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "right",
  },
  invoiceNumber: {
    fontSize: 11,
    color: "#6b7280",
    textAlign: "right",
    marginTop: 4,
  },
  statusBadge: {
    alignSelf: "flex-end",
    marginTop: 10,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    fontSize: 10,
    fontWeight: "bold",
  },
  partiesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: "1 solid #e5e7eb",
  },
  partyBlock: {
    flexDirection: "column",
    maxWidth: "45%",
  },
  partyLabel: {
    fontSize: 9,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  partyName: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1f2937",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  metaBlock: {
    flexDirection: "column",
  },
  metaLabel: {
    fontSize: 9,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1f2937",
  },
  lineItemTable: {
    marginBottom: 30,
  },
  lineItemHeader: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  lineItemHeaderText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  lineItemRow: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottom: "1 solid #f1f5f9",
  },
  lineItemDescription: {
    flex: 3,
    fontSize: 11,
    color: "#1f2937",
  },
  lineItemAmount: {
    flex: 1,
    fontSize: 11,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "right",
  },
  totalsBlock: {
    alignSelf: "flex-end",
    width: "45%",
    marginBottom: 40,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  totalDivider: {
    borderTop: "2 solid #1797b9",
    marginTop: 6,
    paddingTop: 10,
  },
  totalLabel: {
    fontSize: 11,
    color: "#6b7280",
  },
  totalValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1f2937",
  },
  amountDueLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1797b9",
  },
  amountDueValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1797b9",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 48,
    right: 48,
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 8,
    borderTop: "1 solid #e5e7eb",
    paddingTop: 14,
  },
});

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  paid: { bg: "#d1fae5", color: "#065f46" },
  pending: { bg: "#fef3c7", color: "#92400e" },
  overdue: { bg: "#fee2e2", color: "#991b1b" },
  draft: { bg: "#f3f4f6", color: "#4b5563" },
};

interface InvoiceForPDF {
  invoiceNumber?: string;
  clientname?: string;
  amount?: number | string;
  dueDate?: string;
  datepaid?: string | null;
  description?: string;
  status?: string;
  createdAt?: string;
}

interface InvoiceDocumentPDFProps {
  invoice: InvoiceForPDF;
  organizationName?: string;
}

function getStatusInfo(invoice: InvoiceForPDF) {
  const status = invoice.status?.toLowerCase();
  if (status === "paid") return { label: "Paid", key: "paid" };
  if (status === "draft") return { label: "Draft", key: "draft" };
  if (invoice.dueDate && new Date(invoice.dueDate) < new Date())
    return { label: "Overdue", key: "overdue" };
  return { label: "Pending", key: "pending" };
}

export const InvoiceDocumentPDF: React.FC<InvoiceDocumentPDFProps> = ({
  invoice,
  organizationName,
}) => {
  const amount =
    typeof invoice.amount === "string"
      ? parseFloat(invoice.amount)
      : invoice.amount ?? 0;
  const statusInfo = getStatusInfo(invoice);
  const statusColors = STATUS_COLORS[statusInfo.key];
  const issueDate = invoice.createdAt ? new Date(invoice.createdAt) : new Date();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Top: brand + invoice title */}
        <View style={styles.topRow}>
          <View>
            <Text style={styles.brand}>{organizationName || "Flowlio"}</Text>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>
              {invoice.invoiceNumber || "N/A"}
            </Text>
            <Text
              style={[
                styles.statusBadge,
                { backgroundColor: statusColors.bg, color: statusColors.color },
              ]}
            >
              {statusInfo.label}
            </Text>
          </View>
        </View>

        {/* From / Bill To */}
        <View style={styles.partiesRow}>
          <View style={styles.partyBlock}>
            <Text style={styles.partyLabel}>From</Text>
            <Text style={styles.partyName}>{organizationName || "Flowlio"}</Text>
          </View>
          <View style={styles.partyBlock}>
            <Text style={styles.partyLabel}>Bill To</Text>
            <Text style={styles.partyName}>{invoice.clientname || "N/A"}</Text>
          </View>
        </View>

        {/* Dates */}
        <View style={styles.metaRow}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Issue Date</Text>
            <Text style={styles.metaValue}>{issueDate.toLocaleDateString()}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Due Date</Text>
            <Text style={styles.metaValue}>
              {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "N/A"}
            </Text>
          </View>
          {invoice.datepaid && (
            <View style={styles.metaBlock}>
              <Text style={styles.metaLabel}>Paid On</Text>
              <Text style={styles.metaValue}>
                {new Date(invoice.datepaid).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        {/* Line item */}
        <View style={styles.lineItemTable}>
          <View style={styles.lineItemHeader}>
            <Text style={[styles.lineItemHeaderText, { flex: 3 }]}>Description</Text>
            <Text style={[styles.lineItemHeaderText, { flex: 1, textAlign: "right" }]}>
              Amount
            </Text>
          </View>
          <View style={styles.lineItemRow}>
            <Text style={styles.lineItemDescription}>
              {invoice.description || "Services rendered"}
            </Text>
            <Text style={styles.lineItemAmount}>${amount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totalsBlock}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>${amount.toFixed(2)}</Text>
          </View>
          <View style={[styles.totalRow, styles.totalDivider]}>
            <Text style={styles.amountDueLabel}>Amount Due</Text>
            <Text style={styles.amountDueValue}>${amount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Generated by Flowlio · {new Date().toLocaleDateString()}</Text>
        </View>
      </Page>
    </Document>
  );
};
