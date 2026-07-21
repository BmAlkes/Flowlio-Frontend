import {
  FC,
  useState,
  useEffect,
  useContext,
  createContext,
  PropsWithChildren,
} from "react";
import { createAuthClient, type BetterFetchError } from "better-auth/react";
import {
  adminClient,
  emailOTPClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import * as permissions from "@/configs/permission.config";
import { backendURL } from "@/configs/axios.config";
import { useUserProfile } from "@/hooks/useuserprofile";
import { useQueryClient } from "@tanstack/react-query";
import { clearLastVisitedPage } from "@/utils/sessionPersistence.util";
import { usePortalActivityTracker } from "@/hooks/usePortalActivityTracker";

const { ac, roles } = permissions;

export const authClient = createAuthClient({
  plugins: [adminClient({ ac, roles }), emailOTPClient(), twoFactorClient()],
  baseURL: backendURL,
});

type SessionObject = typeof authClient.$Infer.Session;
export type Role = keyof typeof roles;

type Data = {
  user: SessionObject["user"] & {
    role: Role;
    subadminId: string;
    isSuperAdmin: boolean;
    /** Set true for account purchaser (org owner); allows Invoices, Payment Links, Client Management, User Management */
    isOrganizationOwner?: boolean;
    /** Allows same access as owner except User Management */
    isOrganizationManager?: boolean;
    organizationId?: string;
    organization?: {
      id: string;
      name: string;
      slug: string;
    };
    notificationPreferences?: {
      paymentAlerts: boolean;
      invoiceReminders: boolean;
      projectActivityUpdates: boolean;
      emailNotifications: boolean;
      pushNotifications: boolean;
      smsNotifications: boolean;
      [key: string]: any;
    };
    phone?: string;
    address?: string;
    status?: string | null;
    selectedPlanId?: string | null;
    pendingOrganizationData?: {
      organizationName?: string;
      organizationWebsite?: string;
      organizationIndustry?: string;
      organizationSize?: string;
      planId?: string;
    } | null;
    /** For role "client": the client record id used for client-scoped API calls */
    clientId?: string | null;
    position?: string | null;
  };
  session: SessionObject["session"];
};

interface ContextData {
  refetchUser: () => Promise<void>;
  isLoading: boolean;
  data: Data | null;
  isSuperAdmin: boolean;
  subadminId: string;
  role: string;
}

interface BeterAuthProviderProps extends PropsWithChildren {
  /**
   * @type boolean
   * @default false
   * @description periodically fetches user if server throws error while fetching session, should be used for development reason.
   */
  refetchOnError?: boolean;
  /**
   * @type function
   * @param error Error
   * @returns void
   * @description contains session error.
   */
  onError?: (error: BetterFetchError) => void;
}

const UserAuthContext = createContext<ContextData>({} as any);

/** Mirrors the merge logic in UserProvider's sync effect — pulled out so
 * forceRefreshUser can compute the final value directly from freshly-fetched
 * data instead of waiting for that effect to re-run on its own schedule. */
function buildEnhancedUserData(authData: any, userProfileData: any): Data | null {
  if (!authData?.user) return null;
  if (!userProfileData?.data) return authData as Data;
  return {
    ...authData,
    user: {
      ...authData.user,
      ...userProfileData.data,
      role: userProfileData.data.role || authData.user.role,
      subadminId: userProfileData.data.subadminId,
      isSuperAdmin: userProfileData.data.isSuperAdmin,
      isOrganizationManager: userProfileData.data.isOrganizationManager,
      clientId:
        userProfileData.data.clientId || userProfileData.data.clientProfile?.id,
      organizationId:
        userProfileData.data.organizationId ||
        userProfileData.data.clientProfile?.organizationId ||
        authData.user.organizationId,
    },
  } as unknown as Data;
}

const PortalActivityTracker = () => {
  usePortalActivityTracker();
  return null;
};

/**
 * UserProvider supplies authentication and user session context to the application.
 *
 * This provider manages user state, session, and loading status, and should wrap your app at the top level
 * (e.g., in App.tsx or main layout) to ensure all components have access to user context via useUser().
 *
 * @example
 *   <UserProvider>
 *     <App />
 *   </UserProvider>
 *
 * Must be used at the top level of your React component tree.
 */
export const UserProvider: FC<BeterAuthProviderProps> = ({
  onError,
  children,
  refetchOnError = false,
}) => {
  const { data: authData, isPending, error, refetch } = authClient.useSession();
  const [data, setData] = useState<ContextData["data"]>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previousUserId, setPreviousUserId] = useState<string | null>(null);
  const refetchUser = refetch;
  const queryClient = useQueryClient();

  // Fetch fresh user profile with subadminId
  const {
    data: userProfileData,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useUserProfile({
    enabled: !!authData?.user?.id,
  });

  // Clear React Query cache when user changes (login/logout)
  useEffect(() => {
    const currentUserId = authData?.user?.id;

    if (previousUserId && currentUserId !== previousUserId) {
      // Clear all queries except auth-related ones
      queryClient.removeQueries({ queryKey: ["user-profile"] });
      queryClient.removeQueries({ queryKey: ["get-current-org-user-members"] });
      queryClient.removeQueries({ queryKey: ["get-all-user-members"] });
      queryClient.removeQueries({ queryKey: ["projects"] });
      queryClient.removeQueries({ queryKey: ["project"] });
      queryClient.removeQueries({ queryKey: ["organization-clients"] });
      queryClient.removeQueries({ queryKey: ["organization-users"] });
      queryClient.removeQueries({ queryKey: ["calendar-events"] });
      queryClient.removeQueries({ queryKey: ["calendar-event"] });
      queryClient.removeQueries({ queryKey: ["viewer-calendar-events"] });
    }

    setPreviousUserId(currentUserId || null);
  }, [authData?.user?.id, previousUserId, queryClient]);

  useEffect(() => {
    // Show loading while any authentication process is running
    if (isPending || profileLoading) {
      setIsLoading(true);
      return;
    }

    // Clear data when no session exists (logout scenario)
    // Be more lenient - only clear if we're sure there's no session
    if (!authData?.user) {
      setData(null);
      setIsLoading(false);

      // Clear session persistence data on logout
      clearLastVisitedPage();

      // Cancel all ongoing queries and clear cache when logging out
      queryClient.cancelQueries();
      queryClient.clear();
      queryClient.removeQueries();

      return;
    }

    // User is logged in - process session data
    if (authData?.user) {
      setData(buildEnhancedUserData(authData, userProfileData));
      setIsLoading(false);
    }

    if (error) {
      onError?.(error);
      if (refetchOnError) {
        setTimeout(() => {
          refetchUser();
        }, 1000);
      }
    }
  }, [
    authData,
    isPending,
    error,
    onError,
    refetchOnError,
    userProfileData,
    profileLoading,
    refetchUser,
    queryClient,
  ]);

  // Function to force refresh user data (useful after login/logout). Computes
  // the merged value directly from the freshly-resolved responses instead of
  // relying on the sync effect above to re-run before the caller continues —
  // that gap was a real race: on slower devices (seen consistently on mobile
  // Safari), a caller's `navigate()` right after `await refetchUser()` could
  // fire before the effect had processed the new session, so ProtectedRoute's
  // guard read a still-stale "no user" context and bounced back to sign-in
  // even though the login had actually succeeded.
  const forceRefreshUser = async () => {
    setIsLoading(true);
    setData(null);

    const [sessionResult, profileResult] = await Promise.all([
      authClient.getSession(),
      refetchProfile(),
    ]);

    setData(buildEnhancedUserData(sessionResult?.data, profileResult?.data));
    setIsLoading(false);

    // Keep the useSession() hook itself in sync for other consumers of authData.
    refetchUser();
  };

  return (
    <UserAuthContext.Provider
      value={{
        data,
        isLoading,
        role: data?.user?.role || "",
        refetchUser: forceRefreshUser, // Use our enhanced refresh function
        isSuperAdmin: data?.user?.isSuperAdmin || false,
        subadminId: data?.user?.subadminId || "",
      }}
    >
      <PortalActivityTracker />
      {children}
    </UserAuthContext.Provider>
  );
};

/**
 * useUser is a custom hook that provides access to the current user, session, loading state, and a refetch function.
 *
 * Must be used within a UserProvider.
 *
 * @example
 *   const { data, isLoading, refetchUser } = useUser();
 *   if (isLoading) return <div>Loading...</div>;
 *   if (data?.user) return <div>Hello, {data.user.name}!</div>;
 *
 * @returns {ContextData}
 */
export const useUser = () => {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
