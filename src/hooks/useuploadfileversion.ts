import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

interface UploadFileVersionParams {
  attachmentId: string;
  file: File;
}

export const useUploadFileVersion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ attachmentId, file }: UploadFileVersionParams) => {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await axios.post(`/attachments/${attachmentId}/versions`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: (_, { attachmentId }) => {
      queryClient.invalidateQueries({ queryKey: ["file-versions", attachmentId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["media-center"] });
    },
  });
};
