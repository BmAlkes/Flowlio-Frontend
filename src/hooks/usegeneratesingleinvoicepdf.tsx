import { useCallback } from "react";
import { pdf } from "@react-pdf/renderer";
import { InvoiceDocumentPDF } from "@/components/invoices/InvoiceDocumentPDF";
import { Invoice } from "./usefetchinvoices";
import { useUser } from "@/providers/user.provider";

export const useGenerateSingleInvoicePDF = () => {
  const { data: userData } = useUser();
  const organizationName = userData?.user?.organization?.name;

  const generateSingleInvoicePDF = useCallback(
    async (invoice: Invoice) => {
      try {
        const convertedInvoice = {
          ...invoice,
          amount:
            typeof invoice.amount === "string"
              ? parseFloat(invoice.amount)
              : invoice.amount,
        };

        const blob = await pdf(
          <InvoiceDocumentPDF invoice={convertedInvoice} organizationName={organizationName} />
        ).toBlob();

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `invoice-${invoice.invoiceNumber || invoice.id}.pdf`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        return { success: true, message: "Invoice PDF generated successfully" };
      } catch (error) {
        console.error("Invoice PDF generation error:", error);
        return {
          success: false,
          message: error instanceof Error ? error.message : "Failed to generate invoice PDF",
        };
      }
    },
    [organizationName]
  );

  return { generateSingleInvoicePDF };
};
