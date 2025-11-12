import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { toast } from "sonner";

export interface ActiveTimeEntry {
  id: string;
  taskId: string;
  startTime: string;
  description: string;
  taskTitle: string;
  projectName: string;
}

export interface ActiveTimeEntriesResponse {
  success: boolean;
  message: string;
  data: ActiveTimeEntry[];
}

export const useActiveTimeEntries = () => {
  return useQuery<ActiveTimeEntriesResponse>({
    queryKey: ["active-time-entries"],
    queryFn: async () => {
      try {
        const response = await axios.get("/tasks/active-time");
        return response.data;
      } catch (error: any) {
        // Fallback for viewer routes (some environments mount under /viewer)
        if (error?.response?.status === 404) {
          const fallback = await axios.get("/viewer/tasks/active-time");
          return fallback.data;
        }
        throw error;
      }
    },
    refetchInterval: 5000, // Refresh more frequently for responsiveness
    staleTime: 0,
  });
};

export interface StartTaskResponse {
  success: boolean;
  message: string;
  data: {
    timeEntryId: string;
    startTime: string;
    taskId: string;
    taskTitle: string;
  };
}

export interface EndTaskResponse {
  success: boolean;
  message: string;
  data: {
    timeEntryId: string;
    startTime: string;
    endTime: string;
    duration: number;
    taskId: string;
    taskTitle: string;
  };
}

export const useStartTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string): Promise<StartTaskResponse> => {
      const response = await axios.post(`/tasks/${taskId}/start`);
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Task started successfully!", data);
      // Invalidate tasks and time entries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["active-time-entries"] });
      queryClient.invalidateQueries({ queryKey: ["all-time-entries"] });
      queryClient.invalidateQueries({
        queryKey: ["organization-weekly-hours-tracked"],
      });

      toast.success(`Started tracking: ${data.data.taskTitle}`);
    },
    onError: (error: any) => {
      console.error("Error starting task:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to start task";
      toast.error(errorMessage);
    },
  });
};

export const useEndTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string): Promise<EndTaskResponse> => {
      const response = await axios.post(`/tasks/${taskId}/end`);
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Task ended successfully!", data);
      // Invalidate tasks and time entries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["active-time-entries"] });
      queryClient.invalidateQueries({ queryKey: ["all-time-entries"] });
      queryClient.invalidateQueries({
        queryKey: ["organization-weekly-hours-tracked"],
      });

      const durationHours = Math.floor(data.data.duration / 60);
      const durationMinutes = data.data.duration % 60;
      toast.success(
        `Completed: ${data.data.taskTitle} (${durationHours}h ${durationMinutes}m)`
      );
    },
    onError: (error: any) => {
      console.error("Error ending task:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to end task";
      toast.error(errorMessage);
    },
  });
};

export const useDeleteTimeEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryId: string) => {
      try {
        const response = await axios.delete(`/tasks/time-entries/${entryId}`);
        return response.data;
      } catch (error: any) {
        // Fallback for viewer routes
        if (error?.response?.status === 404) {
          const fallback = await axios.delete(
            `/viewer/tasks/time-entries/${entryId}`
          );
          return fallback.data;
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-time-entries"] });
      queryClient.invalidateQueries({ queryKey: ["active-time-entries"] });
      queryClient.invalidateQueries({
        queryKey: ["organization-weekly-hours-tracked"],
      });
      toast.success("Time entry deleted successfully");
    },
    onError: (error: any) => {
      console.error("Error deleting time entry:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to delete time entry";
      toast.error(errorMessage);
    },
  });
};
