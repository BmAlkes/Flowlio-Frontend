import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

export interface InteractionReply {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  userName: string;
}

export interface OrgInteraction {
  id: string;
  clientId: string;
  clientName: string;
  content: string;
  type: string;
  createdAt: string;
  userId: string;
  userName: string;
  replies?: InteractionReply[];
}

export interface GetOrgInteractionsResponse {
  success: boolean;
  message: string;
  data: OrgInteraction[];
  total: number;
  page: number;
  totalPages: number;
}

export interface FetchOrgInteractionsParams {
  page?: number;
  limit?: number;
}

export const useFetchOrgInteractions = (params?: FetchOrgInteractionsParams) => {
  return useQuery({
    queryKey: ["org-interactions", params],
    queryFn: async (): Promise<GetOrgInteractionsResponse> => {
      const response = await axios.get("/crm/interactions", { params });
      return response.data;
    },
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
};
