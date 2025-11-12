import {
  axios,
  type ApiResponse,
  type ErrorWithMessage,
} from "@/configs/axios.config";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface UpdateProfileImageRequest {
  image: File;
}

export interface UpdateProfileImageResponse {
  image: string;
  user: any;
}

export const useUpdateProfileImage = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<UpdateProfileImageResponse>,
    ErrorWithMessage,
    UpdateProfileImageRequest
  >({
    mutationKey: ["update profile image"],
    mutationFn: async (data) => {
      const formData = new FormData();
      formData.append("image", data.image);

      const res = await axios.put<ApiResponse<UpdateProfileImageResponse>>(
        `/user/profile/image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return res.data;
    },
    onSuccess: () => {
      // Invalidate and refetch user profile data
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["user profile"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["getSession"] });
    },
  });
};
