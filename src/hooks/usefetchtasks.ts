import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status:
    | "todo"
    | "in_progress"
    | "completed"
    | "updated"
    | "delay"
    | "changes";
  startDate?: string;
  endDate?: string;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
  }>;
  createdAt: string;
  updatedAt: string;
  parentId?: string;
  // Project data
  projectId: string;
  projectName: string;
  projectNumber: string;
  // Assignee data
  assigneeId?: string;
  assigneeName?: string;
  assigneeEmail?: string;
  assigneeImage?: string;
  // Creator data
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  // Client data
  clientId?: string;
  clientName?: string;
  clientEmail?: string;
  clientImage?: string;
  // Dependencies
  startAfter?: string | null;
  finishBefore?: string | null;
}

export interface GetTasksResponse {
  success: boolean;
  message: string;
  data: Task[];
}

export const useFetchTasks = (params?: {
  projectId?: string;
  status?: string;
  assignedTo?: string;
}) => {
  return useQuery({
    queryKey: ["tasks", params],
    queryFn: async (): Promise<GetTasksResponse> => {
      const searchParams = new URLSearchParams();
      if (params?.projectId) searchParams.append("projectId", params.projectId);
      if (params?.status) searchParams.append("status", params.status);
      if (params?.assignedTo)
        searchParams.append("assignedTo", params.assignedTo);

      const url = searchParams.toString()
        ? `/tasks/all?${searchParams.toString()}`
        : "/tasks/all";

      const response = await axios.get(url);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useFetchTasksByAssignee = (assigneeId: string | undefined) => {
  return useQuery({
    queryKey: ["tasks", { assignedTo: assigneeId }],
    queryFn: async (): Promise<GetTasksResponse> => {
      const searchParams = new URLSearchParams();
      if (assigneeId) searchParams.append("assignedTo", assigneeId);
      const url = `/tasks/all?${searchParams.toString()}`;
      const response = await axios.get(url);
      return response.data;
    },
    enabled: !!assigneeId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useFetchTaskById = (taskId: string) => {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: async (): Promise<{
      success: boolean;
      message: string;
      data: Task;
    }> => {
      const response = await axios.get(`/tasks/${taskId}`);
      return response.data;
    },
    enabled: !!taskId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useFetchSubtasks = (parentTaskId: string | undefined) => {
  return useQuery({
    queryKey: ["tasks", "subtasks", parentTaskId],
    queryFn: async (): Promise<GetTasksResponse> => {
      const response = await axios.get(`/tasks/${parentTaskId}/subtasks`);
      return response.data;
    },
    enabled: !!parentTaskId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};
