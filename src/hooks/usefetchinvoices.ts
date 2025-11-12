import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientname: string;
  amount: string;
  status: string;
  datepaid?: string;
  createdAt: string;
  pdfUrl?: string;
  pdfFileName?: string;
  pdfFileSize?: number;
  dueDate?: string;
}

interface FetchInvoicesResponse {
  success: boolean;
  message: string;
  data: Invoice[];
}

const fetchInvoices = async (): Promise<FetchInvoicesResponse> => {
  try {
    const response = await axios.get("/invoices");
    return response.data;
  } catch (error: any) {
    console.error("Error fetching invoices:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch invoices"
    );
  }
};

export const useFetchInvoices = () => {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: fetchInvoices,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
