import { FC, useEffect } from "react";
import { useNavigate } from "react-router";
import { useUser } from "@/providers/user.provider";
import { getRoleBasedRedirectPathAfterLogin } from "@/utils/sessionPersistence.util";

interface RoleBasedRedirectProps {
  fallbackPath?: string;
  onRedirect?: (path: string) => void;
}

/**
 * RoleBasedRedirect Component
 *
 * Automatically redirects users to their appropriate dashboard based on their role
 * after successful authentication. This component handles:
 *
 * 1. Stored redirect paths from ProtectedRoute
 * 2. Last visited pages
 * 3. Role-based default dashboards
 *
 * Usage:
 * <RoleBasedRedirect fallbackPath="/dashboard" />
 */
export const RoleBasedRedirect: FC<RoleBasedRedirectProps> = ({
  onRedirect,
}) => {
  const { data: userData, isLoading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    // Don't redirect if user is not authenticated
    if (!userData?.user) return;

    const userRole = userData.user.role;

    // Get comprehensive role-based redirect path
    const redirectPath = getRoleBasedRedirectPathAfterLogin(userRole);

    // Call onRedirect callback if provided
    if (onRedirect) {
      onRedirect(redirectPath);
    }

    // Navigate to the appropriate path
    navigate(redirectPath, { replace: true });
  }, [userData, isLoading, navigate, onRedirect]);

  // Show loading while determining redirect path
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Redirecting...</p>
          <p className="text-gray-500 text-sm mt-2">
            Please wait while we redirect you to your dashboard
          </p>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated
  if (!userData?.user) {
    return null;
  }

  // This should not be reached due to useEffect navigation
  return null;
};

export default RoleBasedRedirect;
