import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import type { ApiResponse } from "@/configs/axios.config";
import { toast } from "sonner";

export const useDeleteActivity = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<{ id: string }>,
    Error,
    { id: string; source?: string }
  >({
    mutationFn: async ({ id, source }) => {
      // Use 'source' field to determine which table to delete from
      // source: "recent" = recentActivities, "audit" = auditLogs, "notification" = notifications
      const params = source ? `?type=${source}` : "";
      const response = await axios.delete<ApiResponse<{ id: string }>>(
        `/organizations/activities/${id}${params}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["organization-activities"],
      });
      toast.success("Activity deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete activity");
    },
  });
};
