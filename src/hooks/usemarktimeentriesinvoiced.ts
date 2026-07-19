import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

interface MarkTimeEntriesInvoicedRequest {
  entryIds: string[];
  invoiceId: string;
}

export const useMarkTimeEntriesInvoiced = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ entryIds, invoiceId }: MarkTimeEntriesInvoicedRequest) => {
      const response = await axios.post("/tasks/time-entries/mark-invoiced", {
        entryIds,
        invoiceId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-time-entries"] });
    },
    // Best-effort: the invoice itself is already created by the time this runs,
    // so a failure here only risks the same hours being billed again later —
    // surfaced by the caller as a warning, not a blocking error.
  });
};
