import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { toast } from "sonner";

export interface CreateProjectCommentRequest {
  projectId: string;
  content: string;
  parentId?: string;
}

export interface CreateProjectCommentResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    projectId: string;
    userId: string;
    content: string;
    parentId?: string;
    createdAt: string;
    updatedAt: string;
  };
}

export const useCreateProjectComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: CreateProjectCommentRequest
    ): Promise<CreateProjectCommentResponse> => {
      const response = await axios.post("/projects/comments", data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch project comments
      console.log("data", data);
      queryClient.invalidateQueries({
        queryKey: ["project-comments", variables.projectId],
      });

      toast.success("Comment added successfully!");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Failed to add comment";
      toast.error(errorMessage);
    },
  });
};
