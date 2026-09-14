import {
  axios,
  type ApiResponse,
  type ErrorWithMessage,
} from "@/configs/axios.config";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { isAxiosError, isCancel } from "axios";

export interface UserProfile {
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
  position: string | null;
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

export const profileQueryKey = (userId?: string, sessionId?: string) =>
  ["user-profile", userId ?? null, sessionId ?? null] as const;

export async function fetchUserProfile(userId: string, signal?: AbortSignal) {
  const request = () =>
    axios.get<ApiResponse<UserProfile>>("/user/profile", {
      signal,
      headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
    });
  const response = await request()
    .catch((error: unknown) => {
      // Login may finish while the session hook is catching up. Retry once;
      // the response below must still match the requested user identity.
      if (isCancel(error) && !signal?.aborted) return request();
      throw error;
    })
    .catch((error: unknown) => {
      const body = isAxiosError(error) ? error.response?.data : null;
      if (
        body?.data?.id !== userId ||
        !["USER_PENDING", "USER_PENDING_NO_PLAN"].includes(body?.code)
      )
        throw error;
      // Pending registration may enter checkout, but carries no organization privileges.
      return {
        data: {
          message: body.message,
          data: {
            ...body.data,
            role: "user",
            status: "pending",
            isSuperAdmin: false,
            isOrganizationOwner: false,
            isOrganizationManager: false,
            organizationId: null,
            organization: null,
            clientId: null,
            clientProfile: null,
            subadminId: null,
          } as UserProfile,
        },
      };
    });
  if (response.data.data?.id !== userId) {
    throw new Error("Profile does not belong to the current session");
  }
  return response.data;
}

export const useUserProfile = (options?: { enabled?: boolean }) => {
  const { data: session } = authClient.useSession();
  return useQuery<ApiResponse<UserProfile>, ErrorWithMessage>({
    queryKey: profileQueryKey(session?.user.id, session?.session.id),
    queryFn: ({ signal }) => fetchUserProfile(session!.user.id, signal),
    retry: 1,
    staleTime: 0, // No caching - always fetch fresh data
    gcTime: 0, // No garbage collection time - always fresh
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch when component mounts
    refetchOnReconnect: true, // Refetch when reconnecting
    enabled: !!session?.user.id && options?.enabled !== false,
  });
};
