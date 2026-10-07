import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { ApiResponse } from "@/configs/axios.config";
import { useDataScope } from "./useDataScope";

export interface ViewerProject {
  id: string;
  name: string;
  projectNumber: string;
  description?: string;
  status: "pending" | "ongoing" | "completed";
  progress: number;
  startDate: Date | null;
  endDate: Date | null;
  assignedTo: string;
  createdAt: Date;
  updatedAt: Date;
  clientId: string;
  clientName: string;
  clientImage?: string;
  totalTasks: number;
  completedTasks: number;
}

export const useFetchViewerProjects = (
  options?: Omit<
    UseQueryOptions<ApiResponse<ViewerProject[]>>,
    "queryKey" | "queryFn"
  >,
) => {
  const scope = useDataScope();
  return useQuery<ApiResponse<ViewerProject[]>>({
    queryKey: ["viewer-projects", scope],
    queryFn: async () => {
      const response =
        await axios.get<ApiResponse<ViewerProject[]>>("/viewer/projects");
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    ...options,
  });
};
