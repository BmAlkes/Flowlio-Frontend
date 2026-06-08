import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

export interface OrgComment {
  id: string;
  projectId: string;
  projectName: string;
  taskId?: string;
  taskTitle?: string;
  userId: string;
  userName: string;
  content: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  replies?: OrgComment[];
}

export interface GetAllOrgCommentsResponse {
  success: boolean;
  message: string;
  data: OrgComment[];
  total: number;
  page: number;
  totalPages: number;
}

export interface FetchAllOrgCommentsParams {
  projectId?: string;
  page?: number;
  limit?: number;
}

export const useFetchAllOrgComments = (params?: FetchAllOrgCommentsParams) => {
  return useQuery({
    queryKey: ["org-comments", params],
    queryFn: async (): Promise<GetAllOrgCommentsResponse> => {
      const response = await axios.get("/projects/comments", { params });
      return response.data;
    },
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
};
