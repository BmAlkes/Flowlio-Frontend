import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

export interface RecurringInvoice {
  id: string;
  templateName: string;
  clientId: string;
  clientname: string;
  amount: string;
  description?: string;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  startDate: string;
  endDate?: string;
  lastRunDate?: string;
  nextRunDate: string;
  status: "active" | "paused" | "completed";
  createdAt: string;
  updatedAt: string;
  client?: any;
}

interface FetchRecurringInvoicesResponse {
  success: boolean;
  message: string;
  data: RecurringInvoice[];
}

const fetchRecurringInvoices = async (): Promise<FetchRecurringInvoicesResponse> => {
  try {
    const response = await axios.get("/invoices/recurring");
    return response.data;
  } catch (error: any) {
    console.error("Error fetching recurring invoices:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch recurring invoices",
    );
  }
};

export const useFetchRecurringInvoices = () => {
  return useQuery({
    queryKey: ["recurring-invoices"],
    queryFn: fetchRecurringInvoices,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
