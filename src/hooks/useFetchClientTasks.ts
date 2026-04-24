import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { ApiResponse } from "@/configs/axios.config";

export interface ClientTask {
  id: string;
  title: string;
  description?: string;
  status: string;
  endDate?: string;
  startDate?: string;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  projectName: string;
  assigneeName?: string;
  attachments?: Array<any>;
}

export interface ClientTasksData {
  clientId: string;
  clientName: string;
  taskCount: number;
  tasks: ClientTask[];
}

export const useFetchClientTasks = (
  clientId?: string,
  organizationId?: string,
) => {
  return useQuery<ApiResponse<ClientTasksData>>({
    queryKey: ["client-tasks", clientId, organizationId],
    queryFn: async () => {
      const response = await axios<ApiResponse<ClientTasksData>>({
        method: "POST",
        url: `/tasks/client/${clientId}`,
        data: { organizationId },
      });
      return response.data;
    },
    enabled: !!clientId && !!organizationId,
    staleTime: 5 * 60 * 1000,
  });
};
