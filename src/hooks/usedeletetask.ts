import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { toast } from "sonner";

export interface DeleteTaskResponse {
  success: boolean;
  message: string;
}

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string): Promise<DeleteTaskResponse> => {
      const response = await axios.delete(`/tasks/${taskId}`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });

      // Invalidate dashboard stats when task is deleted
      queryClient.invalidateQueries({
        queryKey: ["organization-pending-tasks"],
      });
      queryClient.invalidateQueries({
        queryKey: ["organization-hours-tracked"],
      });
      queryClient.invalidateQueries({
        queryKey: ["organization-weekly-hours-tracked"],
      });
      queryClient.invalidateQueries({
        queryKey: ["organization-active-projects"],
      });

      // Invalidate chart queries for real-time updates
      queryClient.invalidateQueries({ queryKey: ["project-schedule-data"] });
      queryClient.invalidateQueries({ queryKey: ["project-status-data"] });

      toast.success("Task deleted successfully!");
    },
    onError: (error: any) => {
      console.error("Error deleting task:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to delete task";
      toast.error(errorMessage);
    },
  });
};
