import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

export interface ProjectComment {
  id: string;
  projectId: string;
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

export const useFetchProjectComments = (projectId: string) => {
  return useQuery({
    queryKey: ["project-comments", projectId],
    queryFn: async (): Promise<GetProjectCommentsResponse> => {
      const response = await axios.get(`/projects/comments/${projectId}`);
      return response.data;
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
