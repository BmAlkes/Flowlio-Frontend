import {
  axios,
  type ApiResponse,
  type ErrorWithMessage,
} from "@/configs/axios.config";
import { useQuery } from "@tanstack/react-query";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  image: string | null;
  isSuperAdmin: boolean;
  role: string;
  subadminId: string | null;
  createdAt: string;
  updatedAt: string;
  organizationId?: string | null;
  organization?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  notificationPreferences?: {
    paymentAlerts: boolean;
    invoiceReminders: boolean;
    projectActivityUpdates: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    [key: string]: any;
  };
  demoOrgInfo?: {
    isDemo: boolean;
    passwordChanged: boolean;
  } | null;
}

export const useUserProfile = (options?: { enabled?: boolean }) => {
  return useQuery<ApiResponse<UserProfile>, ErrorWithMessage>({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<UserProfile>>(
        "/user/profile",
        {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        }
      );
      return response.data;
    },
    retry: 1,
    staleTime: 0, // No caching - always fetch fresh data
    gcTime: 0, // No garbage collection time - always fresh
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch when component mounts
    refetchOnReconnect: true, // Refetch when reconnecting
    ...options,
  });
};
