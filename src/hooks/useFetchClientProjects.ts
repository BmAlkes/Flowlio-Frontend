import { parseResponse } from "@/contracts/parse-response";
import { corePath, clientProjectsResponseSchema, type ProjectStatus } from "@/contracts/core-api";
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
  startDate: string | null;
  endDate: string | null;
  assignedProject: string;
  address: string;
  status: ProjectStatus;
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
      // This read endpoint uses POST with the organization context in the request body.
      const response = await axios<ApiResponse<ClientProjectsData>>({
        method: "POST",
        url: corePath("clientProjects", { clientId: clientId! }),
        data: { organizationId },
      });
      return parseResponse<ApiResponse<ClientProjectsData>>(clientProjectsResponseSchema, response.data);
    },
    enabled: !!clientId && !!organizationId,
    staleTime: 5 * 60 * 1000,
  });
};
