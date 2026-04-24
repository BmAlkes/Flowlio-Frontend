import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { ApiResponse } from "@/configs/axios.config";

export interface Project {
  id: string;
  projectNumber: string;
  projectName: string;
  clientName: string;
  clientId: string;
  description: string;
  startDate: string;
  endDate: string;
  assignedProject: string;
  address: string;
  status: "pending" | "ongoing" | "completed";
  progress: number;
  createdBy: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  assignedTo: string;
  contractfile: string;
  contractfilePublicId: string;
  projectFiles: any;
  tags: string[];
  customFields: Record<string, any>;
}

export interface ClientProjectsData {
  clientId: string;
  clientName: string;
  projectCount: number;
  projects: Project[];
}

export const useFetchClientProjects = (
  clientId?: string,
  organizationId?: string,
) => {
  return useQuery<ApiResponse<ClientProjectsData>>({
    queryKey: ["client-projects", clientId, organizationId],
    queryFn: async () => {
      console.log("Hitting API with:", { clientId, organizationId });
      // axios instance already adds /api to baseUrl
      // Using direct axios call to ensure data (body) is sent with GET request as per backend requirement
      const response = await axios<ApiResponse<ClientProjectsData>>({
        method: "POST",
        url: `/projects/client/${clientId}`,
        data: { organizationId },
      });
      return response.data;
    },
    enabled: !!clientId && !!organizationId,
    staleTime: 5 * 60 * 1000,
  });
};
