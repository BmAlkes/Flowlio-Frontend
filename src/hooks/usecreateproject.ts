import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios, type ErrorWithMessage } from "@/configs/axios.config";

// Request data interface
interface CreateProjectData {
  name: string;
  projectNumber: string;
  clientId: string;
  startDate: string;
  endDate: string;
  assignedTo: string;
  description?: string;
  address: string;
  contractfile?: string;
  organizationId: string;
}

// Response data interface
interface CreateProjectResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    projectNumber: string;
    clientId: string;
    description?: string;
    startDate: string;
    endDate: string;
    assignedTo?: string;
    status: string;
    progress: number;
    address?: string;
    organizationId: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
  };
}

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CreateProjectResponse,
    ErrorWithMessage,
    CreateProjectData
  >({
    mutationFn: async (data: CreateProjectData) => {
      const response = await axios.post<CreateProjectResponse>(
        "/projects/create",
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Project created successfully:", data);

      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
      queryClient.invalidateQueries({
        queryKey: ["organization-projects"],
      });

      // Invalidate dashboard stats when new project is created
      queryClient.invalidateQueries({
        queryKey: ["organization-active-projects"],
      });
      queryClient.invalidateQueries({
        queryKey: ["organization-total-clients"],
      });
    },
    onError: (error) => {
      console.error("Error creating project:", error);
    },
  });
};
