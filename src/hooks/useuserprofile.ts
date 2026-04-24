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
  /** True when user is the account purchaser (organization owner); returned by backend */
  isOrganizationOwner?: boolean;
  /** True when user is an organization manager; returned by backend */
  isOrganizationManager?: boolean;
  role: string;
  subadminId: string | null;
  status?: string | null; // User status: "pending" | "active"
  selectedPlanId?: string | null; // Selected plan ID for pending payment
  pendingOrganizationData?: {
    organizationName?: string;
    organizationWebsite?: string;
    organizationIndustry?: string;
    organizationSize?: string;
    planId?: string;
  } | null; // Pending organization data
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
  clientProfile?: {
    id: string;
    organizationId: string;
    userId?: string;
    name?: string;
    email?: string;
    phone?: string | null;
    address?: string | null;
    image?: string | null;
    imagePublicId?: string | null;
    cpfcnpj?: string | null;
    businessIndustry?: string | null;
    [key: string]: unknown;
  } | null;
  /** For role "client": the client record id for API calls (projects, tasks, invoices) */
  clientId?: string | null;
}

/**
 * For portal `client` users, `/user/profile` often returns null `phone`/`address`/`image` on the
 * user row while the linked CRM record holds values in `clientProfile`. Merge for forms and UI.
 */
export function getMergedProfileFormValues(u: UserProfile): {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  image: string | null;
} {
  const cp = u.clientProfile;
  const phone = u.phone ?? cp?.phone ?? "";
  const address = u.address ?? cp?.address ?? "";
  const image = u.image ?? cp?.image ?? null;
  return {
    fullName: u.name ?? cp?.name ?? "",
    email: u.email ?? cp?.email ?? "",
    phone: phone == null ? "" : String(phone),
    address: address == null ? "" : String(address),
    image,
  };
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
        },
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
