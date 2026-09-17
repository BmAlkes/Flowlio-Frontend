import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

const timerChannel = "flowlio-time-tracking";
function notifyTimerChange() {
  if (typeof BroadcastChannel === "undefined") return;
  const channel = new BroadcastChannel(timerChannel);
  channel.postMessage("changed");
  channel.close();
}

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
  const queryClient = useQueryClient();
  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel(timerChannel);
    channel.onmessage = () => {
      void queryClient.invalidateQueries({ queryKey: ["active-time-entries"] });
      void queryClient.invalidateQueries({ queryKey: ["all-time-entries"] });
    };
    return () => channel.close();
  }, [queryClient]);
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
    // Only poll when there's an active time entry, otherwise use longer interval
    // Also pause polling when tab is not visible to save resources
    refetchInterval: (query) => {
      // Don't poll if tab is hidden
      if (document.hidden) {
        return false;
      }

      const hasActiveEntry =
        query.state.data?.data?.length && query.state.data?.data?.length > 0;
      // If there's an active entry, poll every 5 seconds for real-time updates
      // If no active entry, poll every 30 seconds to check for new entries
      return hasActiveEntry ? 5000 : 30000;
    },
    staleTime: 0,
    // Refetch when window becomes visible again
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
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
    status: "active" | "completed";
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
  const attempts = useRef(new Map<string, string>());

  return useMutation({
    mutationFn: async (taskId: string): Promise<StartTaskResponse> => {
      const requestKey = attempts.current.get(taskId) ?? crypto.randomUUID();
      attempts.current.set(taskId, requestKey);
      const response = await axios.post(`/tasks/${taskId}/start`, { requestKey });
      return response.data;
    },
    onSuccess: (data, taskId) => {
      attempts.current.delete(taskId);
      notifyTimerChange();
      // Invalidate tasks and time entries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["active-time-entries"] });
      queryClient.invalidateQueries({ queryKey: ["all-time-entries"] });
      // Invalidate time tracking stats for real-time updates
      queryClient.invalidateQueries({
        queryKey: ["organization-weekly-hours-tracked"],
      });
      queryClient.invalidateQueries({
        queryKey: ["organization-hours-tracked"],
      });
      queryClient.invalidateQueries({
        queryKey: ["team-productivity"],
      });

      toast.success(data.data.status === "completed"
        ? `This timer was already completed: ${data.data.taskTitle}`
        : `Started tracking: ${data.data.taskTitle}`);
    },
    onError: (error: any, taskId) => {
      if (error.response?.status >= 400 && error.response?.status < 500) attempts.current.delete(taskId);
      void queryClient.invalidateQueries({ queryKey: ["active-time-entries"] });
      const errorMessage =
        error.response?.data?.message || "Failed to start task";
      toast.error(errorMessage);
    },
  });
};

export const useEndTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, timeEntryId }: { taskId: string; timeEntryId: string }): Promise<EndTaskResponse> => {
      const response = await axios.post(`/tasks/${taskId}/end`, { timeEntryId });
      return response.data;
    },
    onSuccess: (data) => {
      notifyTimerChange();
      // Invalidate tasks and time entries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["active-time-entries"] });
      queryClient.invalidateQueries({ queryKey: ["all-time-entries"] });
      queryClient.invalidateQueries({ queryKey: ["billable-time"] });
      // Invalidate time tracking stats for real-time updates (especially important when task ends)
      queryClient.invalidateQueries({
        queryKey: ["organization-weekly-hours-tracked"],
      });
      queryClient.invalidateQueries({
        queryKey: ["organization-hours-tracked"],
      });
      queryClient.invalidateQueries({
        queryKey: ["team-productivity"],
      });

      const durationHours = Math.floor(data.data.duration / 60);
      const durationMinutes = data.data.duration % 60;
      toast.success(
        `Completed: ${data.data.taskTitle} (${durationHours}h ${durationMinutes}m)`
      );
    },
    onError: (error: any) => {
      void queryClient.invalidateQueries({ queryKey: ["active-time-entries"] });
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
      notifyTimerChange();
      queryClient.invalidateQueries({ queryKey: ["all-time-entries"] });
      queryClient.invalidateQueries({ queryKey: ["active-time-entries"] });
      // Invalidate time tracking stats for real-time updates
      queryClient.invalidateQueries({
        queryKey: ["organization-weekly-hours-tracked"],
      });
      queryClient.invalidateQueries({
        queryKey: ["organization-hours-tracked"],
      });
      queryClient.invalidateQueries({
        queryKey: ["team-productivity"],
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
