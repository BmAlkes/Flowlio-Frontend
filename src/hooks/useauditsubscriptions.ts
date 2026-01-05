import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface AuditResult {
  subscriptionId: string;
  organizationId: string;
  organizationName: string;
  planName: string;
  planPrice: string;
  status: string;
  issue: string;
}

interface AuditResponse {
  success: boolean;
  message: string;
  data: {
    totalChecked: number;
    foundWithoutPayment: number;
    fixed: number;
    errors: any[];
    report: AuditResult[];
  };
}

export const useAuditSubscriptions = () => {
  return useMutation<AuditResponse>({
    mutationFn: async () => {
      const response = await api.get("/superadmin/subscriptions/audit");
      return response.data;
    },
  });
};

