import { axios } from "@/configs/axios.config";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DEFAULT_PROJECT_TASKS } from "@/utils/projectDefaultTasks";

interface UpdateProjectData {
  name?: string;
  projectNumber?: string;
  clientId?: string;
  startDate?: string;
  endDate?: string;
  assignedTo?: string;
  description?: string;
  address?: string;
  contractfile?: string;
  organizationId?: string;
  visibility?: "public" | "private";
  status?: "pending" | "completed" | "ongoing" | "active" | "delayed";
  progress?: number; // 0-100
  budget?: number;
}

interface UpdateProjectResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    projectNumber: string;
    clientId: string;
    description?: string;
    startDate: Date | null;
    endDate: Date | null;
    assignedTo: string;
    status: string;
    progress: number;
    address: string;
    contractfile?: string;
    contractfilePublicId?: string;
    organizationId: string;
    createdBy: string;
    budget?: number;
    createdAt: Date;
    updatedAt: Date;
  };
}

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateProjectResponse,
    Error,
    { id: string; data: UpdateProjectData }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await axios.put(`/projects/update/${id}`, data);
      return response.data;
    },
    onSuccess: async (data) => {
      toast.success(data.message || "Project updated successfully");

      // 1. Automatic Task Creation Trigger
      if (data.data.status === "ongoing") {
        try {
          // Fetch existing tasks to prevent duplicates
          const { data: existingTasksRes } = await axios.get(
            `/tasks/all?projectId=${data.data.id}`,
          );
          const existingTaskTitles = new Set(
            existingTasksRes.data.map((task: any) => task.title),
          );

          // Find tasks that don't exist yet
          const tasksToCreate = DEFAULT_PROJECT_TASKS.filter(
            (defTask) => !existingTaskTitles.has(defTask.title),
          );

          // Create each missing task with project deadline and assignee
          if (tasksToCreate.length > 0) {
            const projectDeadline = data.data.endDate
              ? new Date(data.data.endDate).toISOString()
              : undefined;

            await Promise.all(
              tasksToCreate.map((task) =>
                axios.post("/tasks/create", {
                  ...task,
                  projectId: data.data.id,
                  endDate: projectDeadline,
                  assignedTo: data.data.assignedTo, // Auto-assign to project owner
                }),
              ),
            );
            toast.info(
              `${tasksToCreate.length} tasks created & assigned to project owner.`,
            );
          }
        } catch (error) {
          console.error("Failed to auto-create tasks:", error);
          // Non-blocking error, project was still updated successfully
        }
      }

      // Invalidate and refetch project-related queries
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["organization-projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", data.data.id] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] }); // Refresh task lists

      // Invalidate dashboard stats
      queryClient.invalidateQueries({
        queryKey: ["organization-active-projects"],
      });
      queryClient.invalidateQueries({
        queryKey: ["organization-pending-tasks"],
      });

      // Invalidate chart queries for real-time updates
      queryClient.invalidateQueries({ queryKey: ["project-schedule-data"] });
      queryClient.invalidateQueries({ queryKey: ["project-status-data"] });
    },
    onError: (error: any) => {
      let errorMessage = "Failed to update project";

      if (error.response?.status === 413) {
        errorMessage =
          "File is too large. Please choose a smaller file (max 10MB).";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      console.error("Update project error:", {
        status: error.response?.status,
        message: errorMessage,
        data: error.response?.data,
      });

      toast.error(errorMessage);
    },
  });
};
