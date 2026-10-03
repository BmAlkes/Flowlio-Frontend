import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { ApiResponse } from "@/configs/axios.config";
import { useDataScope } from "./useDataScope";

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
  const scope = useDataScope();
  return useQuery<ApiResponse<ClientTasksData>>({
    queryKey: ["client-tasks", clientId, organizationId, scope],
    queryFn: async ({signal}) => {
      const response = await axios<ApiResponse<ClientTasksData>>({
        method: "POST",
        url: `/tasks/client/${encodeURIComponent(clientId!)}`,
        data: { organizationId },
        signal,
      });
      if (!Array.isArray(response.data.data?.tasks)) throw new Error("Invalid client tasks response");
      return response.data;
    },
    enabled: !!clientId && !!organizationId,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
  });
};
