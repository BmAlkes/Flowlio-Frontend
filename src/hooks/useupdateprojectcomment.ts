import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { toast } from "sonner";

export interface UpdateProjectCommentRequest {
  commentId: string;
  content: string;
  projectId: string;
  taskId?: string;
}

export interface UpdateProjectCommentResponse {
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

export const useUpdateProjectComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      content,
    }: UpdateProjectCommentRequest): Promise<UpdateProjectCommentResponse> => {
      const response = await axios.patch(`/projects/comments/${commentId}`, {
        content,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["project-comments", variables.projectId, variables.taskId],
      });
      queryClient.invalidateQueries({
        queryKey: ["project-comments", variables.projectId],
      });
      toast.success("Comment updated successfully!");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Failed to update comment";
      toast.error(errorMessage);
    },
  });
};
