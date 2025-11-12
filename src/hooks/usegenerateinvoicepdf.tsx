import { useCallback } from "react";
import { pdf } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/invoices/InvoicePDF";
import { Invoice } from "./usefetchinvoices";

interface GeneratePDFParams {
  invoices: Invoice[];
  exportType: "selected" | "currentPage";
}

export const useGenerateInvoicePDF = () => {
  const generatePDF = useCallback(
    async ({ invoices, exportType }: GeneratePDFParams) => {
      try {
        // Convert amount from string to number for PDF component
        const convertedInvoices = invoices.map((invoice) => ({
          ...invoice,
          amount:
            typeof invoice.amount === "string"
              ? parseFloat(invoice.amount)
              : invoice.amount,
        }));

        // Generate PDF blob
        const blob = await pdf(
          <InvoicePDF invoices={convertedInvoices} exportType={exportType} />
        ).toBlob();

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `invoices-export-${
          new Date().toISOString().split("T")[0]
        }.pdf`;

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up
        URL.revokeObjectURL(url);

        return {
          success: true,
          message: `${invoices.length} invoices exported successfully`,
        };
      } catch (error) {
        console.error("PDF generation error:", error);
        return {
          success: false,
          message:
            error instanceof Error ? error.message : "Failed to generate PDF",
        };
      }
    },
    []
  );

  return { generatePDF };
};
