import {
  axios,
  type ApiResponse,
  type ErrorWithMessage,
} from "@/configs/axios.config";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface UpdateUserProfileRequest {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface UpdateUserProfileResponse {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
    image: string | null;
    emailVerified: boolean;
    isSuperAdmin: boolean;
    role: string;
    subadminId: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<UpdateUserProfileResponse>,
    ErrorWithMessage,
    UpdateUserProfileRequest
  >({
    mutationKey: ["update user profile"],
    mutationFn: async (data) => {
      const res = await axios.put<ApiResponse<UpdateUserProfileResponse>>(
        `/user/profile`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      // Invalidate and refetch user profile data
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["getSession"] });
    },
  });
};
