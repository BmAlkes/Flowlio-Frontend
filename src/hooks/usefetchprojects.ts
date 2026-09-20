import { fetchCollection } from "@/lib/fetch-collection";
import { useDataScope } from "./useDataScope";
import { projectsResponseSchema, projectResponseSchema, corePath, type ProjectStatus } from "@/contracts/core-api";
import { parseResponse } from "@/contracts/parse-response";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

export interface Project {
  id: string;
  projectNumber: string;
  projectName: string;
  clientName: string;
  clientImage?: string;
  description?: string;
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
  clientId?: string;
  assignedTo?: string;
  contractfile?: string;
  projectFiles?: {
    projectPdf?: {
      url: string;
      publicId: string;
      name: string;
      type: string;
    };
  };
  customFields?: Record<string, any>;
  visibility: "public" | "private";
  budget?: number;
}

export interface ProjectsResponse {
  success: boolean;
  message: string;
  data: Project[];
}

interface FetchProjectsParams {
  search?: string;
  status?: string;
}

const fetchProjects = async ({
  search,
  status,
}: FetchProjectsParams): Promise<ProjectsResponse> => {
  const response = await fetchCollection<ProjectsResponse>(corePath("projectsList"), { search, status });
  return parseResponse<ProjectsResponse>(projectsResponseSchema, response);

};

export const useFetchProjects = (
  params: FetchProjectsParams = {},
  options?: Omit<UseQueryOptions<ProjectsResponse>, "queryKey" | "queryFn">,
) => {
  const scope = useDataScope();
  return useQuery({
    queryKey: ["projects", scope, params],
    queryFn: () => fetchProjects(params),
    staleTime: 30_000, // Share fresh reads across tables, calendars and selectors
    gcTime: 5 * 60_000,
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
    ...options,
  });
};

// Hook for fetching a single project by ID
export const useFetchProjectById = (projectId: string) => {
  const scope = useDataScope();
  return useQuery({
    queryKey: ["project", projectId, scope],
    queryFn: async () => {
      const response = await axios.get<{
        success: boolean;
        message: string;
        data: Project;
      }>(corePath("projectDetail", { id: projectId }));
      return parseResponse<{ success: boolean; message: string; data: Project }>(projectResponseSchema, response.data);
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache for 10 minutes
    refetchOnMount: false, // Don't refetch if data is fresh
    refetchOnWindowFocus: false, // Don't refetch on window focus
    retry: 2, // Retry failed requests 2 times
    retryDelay: 1000, // Wait 1 second between retries
  });
};
