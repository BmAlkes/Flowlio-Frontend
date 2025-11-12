import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { axios } from "@/configs/axios.config";

interface CreateInvoiceData {
  clientId: string;
  amount: number;
  description?: string;
  dueDate?: string;
  pdfFile?: string; // Base64 encoded PDF
  pdfFileName?: string;
}

interface CreateInvoiceResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    invoiceNumber: string;
    clientname: string;
    amount: string;
    status: string;
    createdAt: string;
    pdfUrl?: string;
    pdfFileName?: string;
    pdfFileSize?: number;
  };
}

const createInvoice = async (
  data: CreateInvoiceData
): Promise<CreateInvoiceResponse> => {
  try {
    const response = await axios.post("/invoices", data);
    return response.data;
  } catch (error: any) {
    console.error("Error creating invoice:", error);
    throw new Error(
      error.response?.data?.message || "Failed to create invoice"
    );
  }
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      toast.success("Invoice created successfully!");
      // Invalidate and refetch invoices
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create invoice");
    },
  });
};
