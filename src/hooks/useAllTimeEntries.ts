import { useQuery } from "@tanstack/react-query";
import { fetchCollection } from "@/lib/fetch-collection";
import { useDataScope } from "./useDataScope";

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
  /** Set once these tracked hours have been billed on an invoice — prevents double-billing. */
  invoicedAt?: string | null;
}

export interface TimeEntriesResponse {
  success: boolean;
  message: string;
  data: TimeEntry[];
}

export const useAllTimeEntries = () => {
  const scope = useDataScope();
  return useQuery<TimeEntriesResponse>({
    queryKey: ["all-time-entries", scope],
    queryFn: async () => {
      try {
        return await fetchCollection<TimeEntriesResponse>("/tasks/time-entries");
      } catch (error: any) {
        // Fallback for viewer routes
        if (error?.response?.status === 404) {
          return fetchCollection<TimeEntriesResponse>("/viewer/tasks/time-entries");
        }
        throw error;
      }
    },
    staleTime: 30_000,           // share recent results between dashboards
    gcTime: 5 * 60_000,              // retain inactive queries for five minutes
    refetchOnMount: true,   // re-fetch when component mounts
    refetchOnWindowFocus: true, // re-fetch when user returns to tab
  });
};

