import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { toast } from "sonner";

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  projectId?: string;
  assignedTo?: string;
  status?:
    | "todo"
    | "in_progress"
    | "completed"
    | "updated"
    | "delay"
    | "changes";
  startDate?: string;
  endDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
  }>;
}

export interface UpdateTaskResponse {
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

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      data,
    }: {
      taskId: string;
      data: UpdateTaskRequest;
    }): Promise<UpdateTaskResponse> => {
      const response = await axios.put(`/tasks/update/${taskId}`, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      console.log("Task updated successfully!", data);
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });

      // Invalidate dashboard stats when task is updated
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

      toast.success("Task updated successfully!");
    },
    onError: (error: any) => {
      console.error("Error updating task:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update task";
      toast.error(errorMessage);
    },
  });
};

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      status,
    }: {
      taskId: string;
      status:
        | "todo"
        | "in_progress"
        | "completed"
        | "updated"
        | "delay"
        | "changes";
    }): Promise<UpdateTaskResponse> => {
      const response = await axios.patch(`/tasks/status/${taskId}`, { status });
      return response.data;
    },
    onSuccess: (data, variables) => {
      console.log("Task status updated successfully!", data);
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["viewer-tasks"] }); // Added for viewer tasks
      queryClient.invalidateQueries({ queryKey: ["task", variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });

      // Invalidate dashboard stats when task status changes
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

      // Invalidate chart queries for real-time updates (especially important when status changes)
      queryClient.invalidateQueries({ queryKey: ["project-schedule-data"] });
      queryClient.invalidateQueries({ queryKey: ["project-status-data"] });

      toast.success("Task status updated successfully!");
    },
    onError: (error: any) => {
      console.error("Error updating task status:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update task status";
      toast.error(errorMessage);
    },
  });
};
