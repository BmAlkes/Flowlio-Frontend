import { axios } from "@/configs/axios.config";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface TemplateTask {
  id: string;
  title: string;
  description?: string;
  estimatedHours?: string;
  order: number;
}

interface ProjectTemplate {
  id: string;
  name: string;
  description?: string;
  organizationId?: string;
  isGlobal: boolean;
  taskCount: number;
  tasks?: TemplateTask[];
}

interface TemplatesResponse {
  success: boolean;
  data: ProjectTemplate[];
}

export const useFetchProjectTemplates = () => {
  return useQuery<TemplatesResponse, Error>({
    queryKey: ["project-templates"],
    queryFn: async () => {
      const response = await axios.get("/projects/templates/all");
      return response.data;
    },
  });
};

export const useSaveProjectAsTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean; message: string; data: { id: string } },
    Error,
    { projectId: string; templateName: string; description?: string }
  >({
    mutationFn: async (data) => {
      const response = await axios.post("/projects/templates/save-as", data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Project saved as template!");
      queryClient.invalidateQueries({ queryKey: ["project-templates"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to save template");
    },
  });
};

export const useCreateProjectTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean; message: string; data: { id: string } },
    Error,
    { name: string; description?: string; tasks?: any[] }
  >({
    mutationFn: async (data) => {
      const response = await axios.post("/projects/templates/create", data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Template created successfully!");
      queryClient.invalidateQueries({ queryKey: ["project-templates"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create template");
    },
  });
};
export const useUpdateProjectTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean; message: string },
    Error,
    { id: string; data: { name?: string; description?: string; tasks?: any[] } }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await axios.put(`/projects/templates/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Template updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["project-templates"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update template");
    },
  });
};

export const useDeleteProjectTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; message: string }, Error, string>({
    mutationFn: async (id) => {
      const response = await axios.delete(`/projects/templates/${id}`);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Template deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["project-templates"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete template");
    },
  });
};
