import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useUser } from "@/providers/user.provider";
import { toast } from "sonner";
import {
  storeRedirectFrom,
  storeLastVisitedPage,
} from "@/utils/sessionPersistence.util";
import { DemoPasswordGuard } from "./demopasswordguard";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?:
    | "superadmin"
    | "subadmin"
    | "operator"
    | "viewer"
    | "user"
    | "client";
  requiredOrganization?: boolean;
}

const ROLE_HIERARCHY: Record<string, number> = {
  user: 1,
  viewer: 2,
  operator: 3,
  subadmin: 4,
  superadmin: 5,
  // client is separate: only exact match, no hierarchy
  client: -1,
};

const hasRole = (userRole: string, requiredRole: string): boolean => {
  if (requiredRole === "client") return userRole === "client";
  return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[requiredRole] ?? 0);
};

export const ProtectedRoute = ({
  children,
  requiredRole,
  requiredOrganization = false,
}: ProtectedRouteProps) => {
  const { data: userData, isLoading } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't do anything while loading
    if (isLoading) return;

    // User is not authenticated
    if (!userData?.user) {
      // Store the current page for redirect after login
      storeRedirectFrom(location.pathname);

      // Navigate to sign-in immediately (no delays)
      navigate("/auth/signin", {
        replace: true,
        state: { from: location.pathname },
      });
      return;
    }

    // User is authenticated - store this as last visited page
    storeLastVisitedPage(location.pathname);

    const user = userData.user;

    // Check role requirements
    if (requiredRole && user.role) {
      if (!hasRole(user.role, requiredRole)) {
        toast.error(`Access denied. Required role: ${requiredRole}`);

        // Redirect to a safe default page for the current user's role
        let fallbackPath = "/dashboard";
        switch (user.role) {
          case "superadmin":
            fallbackPath = "/superadmin";
            break;
          case "viewer":
            fallbackPath = "/viewer";
            break;
          case "client":
            fallbackPath = "/clients/projects";
            break;
          case "subadmin":
          case "operator":
          case "user":
          default:
            fallbackPath = "/dashboard";
            break;
        }
        navigate(fallbackPath, { replace: true });
        return;
      }
    }

    // Check organization requirements
    if (requiredOrganization && !user.organizationId) {
      toast.error("Organization access required");
      navigate(-1); // Go back to previous page
      return;
    }
  }, [
    userData,
    isLoading,
    requiredRole,
    requiredOrganization,
    navigate,
    location,
  ]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground text-lg font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated
  // The useEffect will handle the redirect
  if (!userData?.user) {
    return null;
  }

  const user = userData.user;

  // Don't render if user doesn't have required role
  if (requiredRole && user.role && !hasRole(user.role, requiredRole)) {
    return null;
  }

  // Don't render if user doesn't have required organization
  if (requiredOrganization && !user.organizationId) {
    return null;
  }

  // User is authenticated and authorized - render the protected content
  // Wrap with DemoPasswordGuard to check for password change requirement
  return <DemoPasswordGuard>{children}</DemoPasswordGuard>;
};

export const SuperAdminRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute requiredRole="superadmin">{children}</ProtectedRoute>
);

export const SubAdminRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute requiredRole="subadmin">{children}</ProtectedRoute>
);

export const OperatorRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute requiredRole="operator">{children}</ProtectedRoute>
);

export const ViewerRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute requiredRole="viewer">{children}</ProtectedRoute>
);

export const UserRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute requiredRole="user">{children}</ProtectedRoute>
);

/** Client portal: only role "client" can access /clients */
export const ClientRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute requiredRole="client">{children}</ProtectedRoute>
);

/** Allow: superadmin, subadmin, or user with isOrganizationOwner (Invoices, Payment Links, Client Management, User Management) */
const hasAdminManagerOrOrgOwnerAccess = (
  role: string,
  isOrganizationOwner?: boolean,
  isOrganizationManager?: boolean,
): boolean =>
  role === "superadmin" ||
  role === "subadmin" ||
  (role === "user" &&
    (isOrganizationOwner === true || isOrganizationManager === true));

export const AdminManagerOrOrgOwnerRoute = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { data: userData, isLoading } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return;
    if (!userData?.user) {
      storeRedirectFrom(location.pathname);
      navigate("/auth/signin", {
        replace: true,
        state: { from: location.pathname },
      });
      return;
    }
    storeLastVisitedPage(location.pathname);
    const user = userData.user;
    if (
      !hasAdminManagerOrOrgOwnerAccess(
        user.role || "",
        user.isOrganizationOwner,
        user.isOrganizationManager,
      )
    ) {
      toast.error(
        "Access denied. This area is for organization owners or managers.",
      );
      navigate("/dashboard", { replace: true });
    }
  }, [userData, isLoading, navigate, location]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground text-lg font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }
  if (!userData?.user) return null;
  if (
    !hasAdminManagerOrOrgOwnerAccess(
      userData.user.role || "",
      userData.user.isOrganizationOwner,
      userData.user.isOrganizationManager,
    )
  ) {
    return null;
  }
  return <DemoPasswordGuard>{children}</DemoPasswordGuard>;
};

/** Allow: superadmin, subadmin, or user with isOrganizationOwner ONLY (User Management) */
export const OrgOwnerOnlyRoute = ({ children }: { children: ReactNode }) => {
  const { data: userData, isLoading } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return;
    if (!userData?.user) {
      storeRedirectFrom(location.pathname);
      navigate("/auth/signin", {
        replace: true,
        state: { from: location.pathname },
      });
      return;
    }
    storeLastVisitedPage(location.pathname);
    const user = userData.user;
    const isSuperOrSub = user.role === "superadmin" || user.role === "subadmin";
    const isOwner = user.role === "user" && user.isOrganizationOwner === true;

    if (!isSuperOrSub && !isOwner) {
      toast.error("Access denied. This area is only for organization owners.");
      navigate("/dashboard", { replace: true });
    }
  }, [userData, isLoading, navigate, location]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground text-lg font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }
  if (!userData?.user) return null;

  const user = userData.user;
  const isSuperOrSub = user.role === "superadmin" || user.role === "subadmin";
  const isOwner = user.role === "user" && user.isOrganizationOwner === true;

  if (!isSuperOrSub && !isOwner) {
    return null;
  }
  return <DemoPasswordGuard>{children}</DemoPasswordGuard>;
};
