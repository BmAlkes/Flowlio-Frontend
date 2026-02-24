import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios, type ApiResponse, type ErrorWithMessage } from "@/configs/axios.config";

interface UpdateOrganizationManagerPayload {
  setAsManager: boolean;
}

/**
 * PATCH /organizations/user-members/:memberId/organization-manager
 * Promote: { setAsManager: true } -> role user + isOrganizationOwner true
 * Demote: { setAsManager: false } -> role viewer + isOrganizationOwner false
 */
export const useUpdateOrganizationManager = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<unknown>,
    ErrorWithMessage,
    { memberId: string; setAsManager: boolean }
  >({
    mutationFn: async ({ memberId, setAsManager }) => {
      const response = await axios.patch<ApiResponse<unknown>>(
        `/organizations/user-members/${memberId}/organization-manager`,
        { setAsManager } as UpdateOrganizationManagerPayload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-current-org-user-members"] });
      queryClient.invalidateQueries({ queryKey: ["get-all-user-members"] });
    },
  });
};
