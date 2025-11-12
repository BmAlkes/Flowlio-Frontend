import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { ApiResponse } from "@/configs/axios.config";

export interface ViewerTask {
  id: string;
  title: string;
  description?: string;
  status:
    | "todo"
    | "in_progress"
    | "completed"
    | "updated"
    | "delay"
    | "changes";
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  // Project information
  projectId: string;
  projectName: string;
  projectNumber: string;
  // Client information
  clientId: string;
  clientName: string;
  clientImage?: string;
  // Creator information
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
}

export const useFetchViewerTasks = () => {
  return useQuery<ApiResponse<ViewerTask[]>>({
    queryKey: ["viewer-tasks"],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<ViewerTask[]>>(
        "/viewer/tasks"
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
