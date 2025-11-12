import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { ApiResponse } from "@/configs/axios.config";

export interface ViewerProjectDetails {
  id: string;
  name: string;
  projectNumber: string;
  description?: string;
  status: "pending" | "ongoing" | "completed";
  progress: number;
  startDate: Date | null;
  endDate: Date | null;
  assignedTo: string;
  address: string;
  contractfile?: string;
  projectFiles?: any;
  createdAt: Date;
  updatedAt: Date;
  // Client information
  clientId: string;
  clientName: string;
  clientImage?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  // Assigned user information
  assignedUserName: string;
  assignedUserEmail: string;
}

export const useFetchViewerProjectById = (projectId: string) => {
  return useQuery<ApiResponse<ViewerProjectDetails>>({
    queryKey: ["viewer-project", projectId],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<ViewerProjectDetails>>(
        `/viewer/projects/${projectId}`
      );
      return response.data;
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
