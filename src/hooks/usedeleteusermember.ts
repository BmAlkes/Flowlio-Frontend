import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  axios,
  type ApiResponse,
  type ErrorWithMessage,
} from "@/configs/axios.config";

interface DeleteUserMemberResponse {
  deletedUserMember: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    userrole: string;
    companyname: string;
  };
  deletedUser: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface DeactivateUserMemberResponse {
  userMember: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    status: string;
    isActive: boolean;
    updatedAt: string;
  };
}

interface ReactivateUserMemberResponse {
  userMember: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    status: string;
    isActive: boolean;
    updatedAt: string;
  };
}

export const useDeleteUserMember = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<DeleteUserMemberResponse>,
    ErrorWithMessage,
    string
  >({
    mutationFn: async (id: string) => {
      const response = await axios.delete<
        ApiResponse<DeleteUserMemberResponse>
      >(`/organizations/user-members/${id}`);
      return response.data;
    },
    onSuccess: (data, id) => {
      console.log("User member deleted successfully:", data);

      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({
        queryKey: ["get-current-org-user-members"],
      });
      queryClient.invalidateQueries({ queryKey: ["get-all-user-members"] });
      queryClient.invalidateQueries({ queryKey: ["fetch user organizations"] });
      queryClient.invalidateQueries({ queryKey: ["fetch all organizations"] });

      // Remove the deleted user member from cache
      queryClient.removeQueries({ queryKey: ["get-user-member-by-id", id] });
    },
    onError: (error) => {
      console.error("Error deleting user member:", error);
    },
  });
};

export const useDeactivateUserMember = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<DeactivateUserMemberResponse>,
    ErrorWithMessage,
    string
  >({
    mutationFn: async (id: string) => {
      const response = await axios.patch<
        ApiResponse<DeactivateUserMemberResponse>
      >(`/organizations/user-members/${id}/deactivate`);
      return response.data;
    },
    onSuccess: (data, id) => {
      console.log("User member deactivated successfully:", data);

      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({
        queryKey: ["get-current-org-user-members"],
      });
      queryClient.invalidateQueries({ queryKey: ["get-all-user-members"] });
      queryClient.invalidateQueries({
        queryKey: ["get-user-member-by-id", id],
      });
    },
    onError: (error) => {
      console.error("Error deactivating user member:", error);
    },
  });
};

export const useReactivateUserMember = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<ReactivateUserMemberResponse>,
    ErrorWithMessage,
    string
  >({
    mutationFn: async (id: string) => {
      const response = await axios.patch<
        ApiResponse<ReactivateUserMemberResponse>
      >(`/organizations/user-members/${id}/reactivate`);
      return response.data;
    },
    onSuccess: (data, id) => {
      console.log("User member reactivated successfully:", data);

      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ["get-current-org-user-members"] });
      queryClient.invalidateQueries({ queryKey: ["get-all-user-members"] });
      queryClient.invalidateQueries({
        queryKey: ["get-user-member-by-id", id],
      });
    },
    onError: (error) => {
      console.error("Error reactivating user member:", error);
    },
  });
};
