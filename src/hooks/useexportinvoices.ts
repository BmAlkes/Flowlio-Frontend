import { axios } from "@/configs/axios.config";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface ExportInvoicesRequest {
  invoiceIds: string[];
  exportType: "selected" | "currentPage";
}

interface ExportInvoicesResponse {
  success: boolean;
  message: string;
  downloadUrl?: string;
}

export const useExportInvoices = () => {
  return useMutation<ExportInvoicesResponse, Error, ExportInvoicesRequest>({
    mutationFn: async ({ invoiceIds, exportType }) => {
      try {
        const response = await axios.post("/invoices/export", {
          invoiceIds,
          exportType,
        });

        return response.data;
      } catch (error: any) {
        console.error("Export invoices error:", error);

        // Handle different error types
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        } else if (error.message) {
          throw new Error(error.message);
        } else {
          throw new Error("Failed to export invoices");
        }
      }
    },
    onSuccess: (data) => {
      toast.success(data.message || "Invoices exported successfully!");

      // If there's a download URL, trigger download
      if (data.downloadUrl) {
        const link = document.createElement("a");
        link.href = data.downloadUrl;
        link.download = `invoices-export-${
          new Date().toISOString().split("T")[0]
        }.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to export invoices");
    },
  });
};
