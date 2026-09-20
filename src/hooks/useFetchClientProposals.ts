import { clientProposalsResponseSchema, corePath, type ProposalStatus } from "@/contracts/core-api";
import { parseResponse } from "@/contracts/parse-response";
import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { ApiResponse } from "@/configs/axios.config";

export interface ClientProposal {
  id: string;
  title: string;
  status: ProposalStatus;
  totalValue: string | number | null;
  sentAt: string | null;
  respondedAt: string | null;
  pdfUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClientProposalsData {
  clientId: string;
  clientName: string;
  proposalCount: number;
  proposals: ClientProposal[];
}

export const useFetchClientProposals = (clientId?: string) => {
  return useQuery<ApiResponse<ClientProposalsData>>({
    queryKey: ["client-proposals-org", clientId],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<ClientProposalsData>>(
        corePath("clientProposals", { clientId: clientId! }),
      );
      return parseResponse<ApiResponse<ClientProposalsData>>(clientProposalsResponseSchema, response.data);
    },
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000,
  });
};
