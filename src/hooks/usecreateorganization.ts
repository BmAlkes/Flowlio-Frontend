import { useMutation } from "@tanstack/react-query";
import {
  axios,
  type ApiResponse,
  type ErrorWithMessage,
} from "@/configs/axios.config";
import { OrganizationResponse } from "./usefetchuserorganizations";
import { SubscriptionResponse } from "./usefetchusersubscriptions";

interface CreateOrganizationWithPlanRequest {
  userId: string;
  organizationName: string;
  organizationWebsite?: string;
  organizationIndustry?: string;
  organizationSize?: string;
  planId: string;
}

export const useCreateOrganizationWithPlan = () => {
  return useMutation<
    ApiResponse<{
      organization: OrganizationResponse;
      subscription: SubscriptionResponse;
      plan: any;
      userRole: string;
    }>,
    ErrorWithMessage,
    CreateOrganizationWithPlanRequest
  >({
    mutationFn: async (data: CreateOrganizationWithPlanRequest) => {
      const response = await axios.post(
        "/organizations/create-with-plan",
        data
      );
      return response.data;
    },
  });
};

