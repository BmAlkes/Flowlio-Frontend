import {
  FC,
  useState,
  useLayoutEffect,
  useRef,
  Fragment,
  useEffect,
  useContext,
  createContext,
  PropsWithChildren,
} from "react";
import { type BetterFetchError } from "better-auth/react";
import { roles } from "@/configs/permission.config";
import { authClient } from "@/lib/auth-client";
export { authClient } from "@/lib/auth-client";
import {
  useUserProfile,
  fetchUserProfile,
  profileQueryKey,
} from "@/hooks/useuserprofile";
import { useQueryClient } from "@tanstack/react-query";
import { clearLastVisitedPage } from "@/utils/sessionPersistence.util";
import { usePortalActivityTracker } from "@/hooks/usePortalActivityTracker";
import { mergeSessionProfile, sessionScope } from "@/utils/sessionScope";
import {
  setRequestScope,
  SESSION_ACCESS_REVOKED,
} from "@/configs/axios.config";

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
    country?: string;
    billingEmail?: string;
    status?: string | null;
    selectedPlanId?: string | null;
    pendingOrganizationData?: {
      organizationName?: string;
      organizationWebsite?: string;
      organizationIndustry?: string;
      organizationSize?: string;
      country?: string;
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

const UserAuthContext = createContext<ContextData | null>(null);

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
  const queryClient = useQueryClient();
  const profile = useUserProfile({ enabled: !!authData?.user.id });
  const [refreshing, setRefreshing] = useState(false);
  const refreshVersion = useRef(0);
  const identity = authData
    ? authData.user.id + ":" + authData.session.id
    : "anonymous";
  const identityRef = useRef(identity);
  identityRef.current = identity;
  const data = (
    profile.isError ? null : mergeSessionProfile(authData, profile.data)
  ) as Data | null;
  const scope = sessionScope(authData, data?.user);
  const [readyScope, setReadyScope] = useState<string | null>(null);

  // Hide and remount consumers before exposing a new identity or organization.
  // Removed queries are cancelled, so late results cannot enter the new cache.
  useLayoutEffect(() => {
    if (readyScope === scope) return;
    setRequestScope(scope, identity);
    const currentProfileKey = JSON.stringify(
      profileQueryKey(authData?.user.id, authData?.session.id),
    );
    const obsolete = {
      predicate: (query: { queryKey: readonly unknown[] }) =>
        JSON.stringify(query.queryKey) !== currentProfileKey,
    };
    void queryClient.cancelQueries(obsolete);
    queryClient.removeQueries(obsolete);
    queryClient.getMutationCache().clear();
    clearLastVisitedPage();
    setReadyScope(scope);
  }, [
    scope,
    identity,
    readyScope,
    queryClient,
    authData?.user.id,
    authData?.session.id,
  ]);

  useEffect(() => {
    if (!error) return;
    onError?.(error);
    if (!refetchOnError) return;
    const timeout = setTimeout(() => void refetch(), 1000);
    return () => clearTimeout(timeout);
  }, [error, onError, refetchOnError, refetch]);

  useEffect(() => {
    const revoke = () => {
      queryClient.setQueriesData({ queryKey: ["user-profile"] }, null);
      void queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      void refetch();
    };
    window.addEventListener(SESSION_ACCESS_REVOKED, revoke);
    return () => window.removeEventListener(SESSION_ACCESS_REVOKED, revoke);
  }, [queryClient, refetch]);

  useEffect(
    () => () => {
      refreshVersion.current++;
    },
    [],
  );

  const forceRefreshUser = async () => {
    const version = ++refreshVersion.current;
    const startingIdentity = identityRef.current;
    setRefreshing(true);
    try {
      const result = await authClient.getSession({
        query: { disableCookieCache: true },
      });
      if (result.error) throw result.error;
      if (!result.data) {
        await refetch();
        return;
      }
      const session = result.data;
      const response = await fetchUserProfile(session.user.id);
      const confirmation = await authClient.getSession({
        query: { disableCookieCache: true },
      });
      if (
        version !== refreshVersion.current ||
        confirmation.data?.session.id !== session.session.id ||
        (identityRef.current !== startingIdentity &&
          identityRef.current !== session.user.id + ":" + session.session.id)
      )
        return;
      queryClient.setQueryData(
        profileQueryKey(session.user.id, session.session.id),
        response,
      );
      await refetch();
    } finally {
      if (version === refreshVersion.current) setRefreshing(false);
    }
  };

  const isLoading =
    isPending ||
    refreshing ||
    (!!authData && profile.isLoading) ||
    readyScope !== scope;
  return (
    <UserAuthContext.Provider
      value={{
        data: isLoading ? null : data,
        isLoading,
        role: data?.user.role || "",
        refetchUser: forceRefreshUser,
        isSuperAdmin: data?.user.isSuperAdmin || false,
        subadminId: data?.user.subadminId || "",
      }}
    >
      {readyScope === scope && (
        <Fragment key={scope}>
          <PortalActivityTracker />
          {children}
        </Fragment>
      )}
    </UserAuthContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserAuthContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};
