import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 40,
    fontSize: 11,
    lineHeight: 1.6,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 35,
    borderBottom: "3 solid #1797b9",
    paddingBottom: 25,
    position: "relative",
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "#f8f9fa",
    opacity: 0.3,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1797b9",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 13,
    color: "#555555",
    textAlign: "center",
    marginBottom: 5,
    fontWeight: "normal",
  },
  invoiceNumbers: {
    fontSize: 12,
    color: "#1797b9",
    textAlign: "center",
    fontWeight: "bold",
    backgroundColor: "#e8f4f8",
    padding: 8,
    borderRadius: 4,
    marginTop: 10,
  },
  invoiceTable: {
    width: "100%",
    marginBottom: 25,
    borderRadius: 8,
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1797b9",
    color: "white",
    fontWeight: "bold",
    padding: 12,
    fontSize: 12,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #e5e7eb",
    padding: 12,
    backgroundColor: "#ffffff",
  },
  tableRowEven: {
    flexDirection: "row",
    borderBottom: "1 solid #e5e7eb",
    padding: 12,
    backgroundColor: "#f8fafc",
  },
  tableCell: {
    flex: 1,
    padding: 6,
    fontSize: 10,
  },
  tableCellRight: {
    flex: 1,
    padding: 6,
    textAlign: "right",
    fontSize: 10,
    fontWeight: "bold",
  },
  summary: {
    marginTop: 35,
    padding: 25,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    border: "2 solid #e5e7eb",
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1797b9",
    marginBottom: 15,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingVertical: 4,
    borderBottom: "1 solid #e5e7eb",
  },
  summaryLabel: {
    fontWeight: "bold",
    color: "#374151",
    fontSize: 11,
  },
  summaryValue: {
    fontWeight: "bold",
    color: "#1797b9",
    fontSize: 11,
  },
  footer: {
    marginTop: 50,
    textAlign: "center",
    color: "#6b7280",
    fontSize: 9,
    borderTop: "1 solid #e5e7eb",
    paddingTop: 15,
  },
  status: {
    padding: "6 12",
    borderRadius: 6,
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
  },
  statusPaid: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
  },
  statusPending: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },
  statusOverdue: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
});

interface Invoice {
  id: string;
  invoiceNumber?: string;
  clientname?: string;
  amount?: number;
  dueDate?: string;
  datepaid?: string;
  description?: string;
  status?: string;
}

interface InvoicePDFProps {
  invoices: Invoice[];
  exportType: "selected" | "currentPage";
}

const getStatusClass = (invoice: Invoice): string => {
  if (invoice.datepaid) return "statusPaid";
  if (invoice.dueDate && new Date(invoice.dueDate) < new Date())
    return "statusOverdue";
  return "statusPending";
};

const getStatusText = (invoice: Invoice): string => {
  if (invoice.datepaid) return "Paid";
  if (invoice.dueDate && new Date(invoice.dueDate) < new Date())
    return "Overdue";
  return "Pending";
};

export const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoices }) => {
  const currentDate = new Date().toLocaleDateString();
  const totalAmount = invoices.reduce(
    (sum, invoice) => sum + (invoice.amount || 0),
    0
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerBackground} />
          <Text style={styles.title}>INVOICE EXPORT REPORT</Text>
          <Text style={styles.subtitle}>Generated on {currentDate}</Text>
          <Text style={styles.invoiceNumbers}>
            Invoice Numbers:{" "}
            {invoices
              .map((invoice) => {
                if (
                  invoice.invoiceNumber &&
                  invoice.invoiceNumber.startsWith("S")
                ) {
                  return invoice.invoiceNumber;
                }
                return null;
              })
              .filter(Boolean)
              .join(", ")}
          </Text>
        </View>

        {/* Invoice Table */}
        <View style={styles.invoiceTable}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.tableCell}>Invoice #</Text>
            <Text style={styles.tableCell}>Client</Text>
            <Text style={styles.tableCellRight}>Amount</Text>
            <Text style={styles.tableCell}>Due Date</Text>
            <Text style={styles.tableCell}>Status</Text>
            <Text style={styles.tableCell}>Description</Text>
          </View>

          {/* Table Rows */}
          {invoices.map((invoice, index) => (
            <View
              key={invoice.id}
              style={index % 2 === 0 ? styles.tableRow : styles.tableRowEven}
            >
              <Text style={styles.tableCell}>
                {invoice.invoiceNumber && invoice.invoiceNumber.startsWith("S")
                  ? invoice.invoiceNumber
                  : "N/A"}
              </Text>
              <Text style={styles.tableCell}>
                {invoice.clientname || "N/A"}
              </Text>
              <Text style={styles.tableCellRight}>
                ${invoice.amount?.toFixed(2) || "0.00"}
              </Text>
              <Text style={styles.tableCell}>
                {invoice.dueDate
                  ? new Date(invoice.dueDate).toLocaleDateString()
                  : "N/A"}
              </Text>
              <Text style={styles.tableCell}>
                <Text
                  style={[
                    styles.status,
                    styles[getStatusClass(invoice) as keyof typeof styles],
                  ]}
                >
                  {getStatusText(invoice)}
                </Text>
              </Text>
              <Text style={styles.tableCell}>
                {invoice.description
                  ? invoice.description.slice(0, 50) + "..."
                  : "N/A"}
              </Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Export Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Invoices:</Text>
            <Text>{invoices.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount:</Text>
            <Text>${totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
            Generated by Flowlio Invoice Management System
          </Text>
          <Text>For support, contact your system administrator</Text>
          <Text style={{ marginTop: 5, fontSize: 8 }}>
            © {new Date().getFullYear()} Flowlio. All rights reserved.
          </Text>
        </View>
      </Page>
    </Document>
  );
};
