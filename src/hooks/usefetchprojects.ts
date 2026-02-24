import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

export interface Project {
  id: string;
  projectNumber: string;
  projectName: string;
  clientName: string;
  clientImage?: string;
  description?: string;
  startDate: Date | null;
  endDate: Date | null;
  assignedProject: string;
  address: string;
  status: "pending" | "completed" | "ongoing";
  progress: number;
  createdBy: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
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
  const params = new URLSearchParams();

  if (search) {
    params.append("search", search);
  }

  if (status) {
    params.append("status", status);
  }

  const response = await axios.get<ProjectsResponse>(
    `/projects/all${params.toString() ? `?${params.toString()}` : ""}`
  );
  return response.data;
};

export const useFetchProjects = (params: FetchProjectsParams = {}) => {
  return useQuery({
    queryKey: ["projects", params],
    queryFn: () => fetchProjects(params),
    staleTime: 0, // No caching - always fetch fresh data
    gcTime: 0, // No garbage collection delay
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });
};

// Hook for fetching a single project by ID
export const useFetchProjectById = (projectId: string) => {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const response = await axios.get<{
        success: boolean;
        message: string;
        data: Project;
      }>(`/projects/${projectId}`);
      return response.data;
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
