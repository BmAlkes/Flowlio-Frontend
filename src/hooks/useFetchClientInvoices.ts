import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { ApiResponse } from "@/configs/axios.config";

export interface ClientInvoice {
  id: string;
  organizationId: string;
  clientId: string;
  createdBy: string;
  invoiceNumber: string;
  clientname: string;
  amount: string;
  status: string;
  datepaid: string | null;
  dueDate: string;
  description: string;
  pdfUrl: string;
  pdfFileName: string;
  pdfFileSize: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClientInvoicesData {
  clientId: string;
  clientName: string;
  invoiceCount: number;
  invoices: ClientInvoice[];
}

export const useFetchClientInvoices = (
  clientId?: string,
  organizationId?: string,
) => {
  return useQuery<ApiResponse<ClientInvoicesData>>({
    queryKey: ["client-invoices", clientId, organizationId],
    queryFn: async () => {
      const response = await axios<ApiResponse<ClientInvoicesData>>({
        method: "POST",
        url: `/invoices/client/${clientId}`,
        data: { organizationId },
      });
      return response.data;
    },
    enabled: !!clientId && !!organizationId,
    staleTime: 5 * 60 * 1000,
  });
};
