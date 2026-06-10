import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

export interface ProjectComment {
  id: string;
  projectId: string;
  taskId?: string;
  userId: string;
  userName: string;
  content: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  replies?: ProjectComment[];
}

export interface GetProjectCommentsResponse {
  success: boolean;
  message: string;
  data: ProjectComment[];
  totalComments: number;
}

export const useFetchProjectComments = (projectId: string, taskId?: string) => {
  return useQuery({
    queryKey: ["project-comments", projectId, taskId],
    queryFn: async (): Promise<GetProjectCommentsResponse> => {
      const url = taskId
        ? `/projects/comments/${projectId}?taskId=${taskId}`
        : `/projects/comments/${projectId}`;
      const response = await axios.get(url);
      if (response.data?.success === false) {
        throw new Error(response.data?.message || "Failed to load comments");
      }
      return response.data;
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};
