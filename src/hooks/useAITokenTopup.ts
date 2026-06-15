import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { toast } from "sonner";

export interface TokenPackage {
  id: string;
  tokens: number;
  price: string;
  currency: string;
  label: string;
}

export interface PurchaseResult {
  orderId: string;
  approvalUrl: string;
  package: TokenPackage;
}

export interface ConfirmResult {
  tokensAdded: number;
  newTokenLimit: number;
}

export const useTokenPackages = () =>
  useQuery<TokenPackage[]>({
    queryKey: ["ai-token-packages"],
    queryFn: async () => {
      const res = await axios.get<{ success: boolean; data: TokenPackage[] }>("/ai/tokens/packages");
      return res.data.data;
    },
    staleTime: 10 * 60 * 1000,
  });

export const usePurchaseTokens = () =>
  useMutation<PurchaseResult, Error, { packageId: string }>({
    mutationFn: async ({ packageId }) => {
      const res = await axios.post<{ success: boolean; data: PurchaseResult }>(
        "/ai/tokens/purchase",
        { packageId }
      );
      return res.data.data;
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to initiate purchase");
    },
  });

export const useConfirmTokenPurchase = () => {
  const queryClient = useQueryClient();
  return useMutation<ConfirmResult, Error, { orderId: string; packageId: string }>({
    mutationFn: async ({ orderId, packageId }) => {
      const res = await axios.post<{ success: boolean; data: ConfirmResult }>(
        "/ai/tokens/confirm",
        { orderId, packageId }
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-org-usage"] });
      queryClient.invalidateQueries({ queryKey: ["ai-limits"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to confirm purchase");
    },
  });
};
