import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { toast } from "sonner";

export interface CreateTaskRequest {
  title: string;
  description?: string;
  projectId: string;
  assignedTo?: string;
  startDate?: string;
  endDate?: string;
  attachments?: Array<{
    id: string;
    file: string;
    name: string;
    url: string;
    size: number;
    type: string;
  }>;
}

export interface CreateTaskResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    title: string;
    description?: string;
    projectId: string;
    assignedTo?: string;
    createdBy: string;
    status: string;
    startDate?: string;
    endDate?: string;
    attachments?: Array<{
      id: string;
      name: string;
      url: string;
      size: number;
      type: string;
    }>;
    createdAt: string;
    updatedAt: string;
  };
}

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: CreateTaskRequest
    ): Promise<CreateTaskResponse> => {
      const response = await axios.post("/tasks/create", data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Invalidate and refetch tasks!", data);
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });

      // Invalidate dashboard stats when new task is created
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

      toast.success("Task created successfully!");
    },
    onError: (error: any) => {
      console.error("Error creating task:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to create task";
      toast.error(errorMessage);
    },
  });
};
