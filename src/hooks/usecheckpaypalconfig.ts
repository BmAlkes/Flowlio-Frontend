import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface PayPalConfigResponse {
  success: boolean;
  data: {
    configured: boolean;
    mode: string;
    isLive: boolean;
    isSandbox: boolean;
    clientId: string;
    isConnected: boolean;
    accountInfo: {
      email: string;
      name: string;
      verified: boolean;
    } | null;
    error: string | null;
    instructions: {
      toUpdateAccount: string;
      toUpdateFrontend: string;
      restartRequired: string;
    };
  };
}

export const useCheckPayPalConfig = (enabled: boolean = true) => {
  return useQuery<PayPalConfigResponse>({
    queryKey: ["paypal-config"],
    queryFn: async () => {
      // Add timestamp to prevent caching
      const response = await api.get("/superadmin/paypal/config", {
        params: {
          _t: Date.now(), // Cache busting parameter
        },
      });
      return response.data;
    },
    enabled,
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Always refetch when component mounts
    staleTime: 0, // Data is immediately stale, always refetch
  });
};
