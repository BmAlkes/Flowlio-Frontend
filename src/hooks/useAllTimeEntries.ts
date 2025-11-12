import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

export interface TimeEntry {
  id: string;
  userId: string;
  projectId: string;
  taskId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  description: string;
  status: "active" | "completed";
  taskTitle: string;
  projectName: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeEntriesResponse {
  success: boolean;
  message: string;
  data: TimeEntry[];
}

export const useAllTimeEntries = () => {
  return useQuery<TimeEntriesResponse>({
    queryKey: ["all-time-entries"],
    queryFn: async () => {
      try {
        const response = await axios.get("/tasks/time-entries");
        return response.data;
      } catch (error: any) {
        // Fallback for viewer routes
        if (error?.response?.status === 404) {
          try {
            const fallback = await axios.get("/viewer/tasks/time-entries");
            return fallback.data;
          } catch (fallbackError: any) {
            // If both fail, return empty list gracefully
            if (fallbackError?.response?.status === 404) {
              return { success: true, message: "No entries", data: [] };
            }
            throw fallbackError;
          }
        }
        throw error;
      }
    },
  });
};
