import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  axios,
  type ApiResponse,
  type ErrorWithMessage,
} from "@/configs/axios.config";

type CreateUserMemberData = FormData;

interface CreateUserMemberResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    image?: string;
  };
  userOrganization: any;
  account: any;
  userManagement: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    phonenumber: string;
    userrole: string;
    companyname: string;
    setpermission: string;
    status: string;
    isActive: boolean;
    organizationId: string;
    createdBy: string;
    image?: string;
  };
}

export const useCreateUserMember = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<CreateUserMemberResponse>,
    ErrorWithMessage,
    CreateUserMemberData
  >({
    mutationFn: async (data: CreateUserMemberData) => {
      const response = await axios.post<ApiResponse<CreateUserMemberResponse>>(
        "/organizations/create-user-member",
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      console.log("User member created successfully:", data);

      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({
        queryKey: ["get-current-org-user-members"],
      });
      queryClient.invalidateQueries({ queryKey: ["fetch user organizations"] });
      queryClient.invalidateQueries({ queryKey: ["fetch all organizations"] });

      // You can add more query invalidations here if needed
    },
    onError: (error) => {
      console.error("Error creating user member:", error);
    },
  });
};
