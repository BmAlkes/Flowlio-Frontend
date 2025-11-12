import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { toast } from "sonner";

export interface DeleteProjectCommentResponse {
  success: boolean;
  message: string;
  data: {
    deletedCommentId: string;
    projectId: string;
  };
}

export const useDeleteProjectComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      commentId: string
    ): Promise<DeleteProjectCommentResponse> => {
      const response = await axios.delete(`/projects/comments/${commentId}`);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch project comments for the specific project
      queryClient.invalidateQueries({
        queryKey: ["project-comments", data.data.projectId],
      });

      toast.success("Comment deleted successfully!");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Failed to delete comment";
      toast.error(errorMessage);
    },
  });
};
