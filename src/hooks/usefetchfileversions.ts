import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { FileVersion } from "@/types";

export interface GetFileVersionsResponse {
  success: boolean;
  message: string;
  data: FileVersion[];
}

export const useFetchFileVersions = (attachmentId: string) => {
  return useQuery({
    queryKey: ["file-versions", attachmentId],
    queryFn: async (): Promise<GetFileVersionsResponse> => {
      const response = await axios.get(`/attachments/${attachmentId}/versions`);
      return response.data;
    },
    enabled: !!attachmentId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};
