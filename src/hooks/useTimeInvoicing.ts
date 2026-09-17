import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

export interface BillableEntry {
  id: string;
  version: string;
  userName: string;
  projectName: string;
  taskTitle: string | null;
  description: string | null;
  startTime: string;
  duration: number;
  hourlyRate: string | null;
}
export interface TimeFilter { clientId: string; start: string; end: string }
export interface TimeInvoiceInput extends TimeFilter {
  requestKey: string;
  entries: { id: string; version: string }[];
  fallbackRate?: string;
  dueDate?: string;
}
export function useBillableTime(filter: TimeFilter | null) {
  return useQuery({
    queryKey: ["billable-time", filter],
    enabled: !!filter,
    queryFn: async () => (await axios.get<{ data: { entries: BillableEntry[]; hasMore: boolean; hasLegacyTimeInvoices?: boolean } }>(
      "/invoices/billable-time", { params: filter },
    )).data.data,
  });
}
export function useInvoiceFromTime() {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: async (input: TimeInvoiceInput) => (await axios.post("/invoices/from-time", input)).data,
    onSuccess: () => {
      for (const key of ["invoices", "billable-time", "all-time-entries", "client-invoices", "total-invoices", "onboarding"]) {
        void cache.invalidateQueries({ queryKey: [key] });
      }
    },
  });
}
