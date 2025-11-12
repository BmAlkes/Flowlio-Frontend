import { useCallback } from "react";
import { useNavigate } from "react-router";
import { useUser } from "@/providers/user.provider";
import { getRoleBasedRedirectPathAfterLogin } from "@/utils/sessionPersistence.util";

/**
 * useRoleBasedRedirect Hook
 *
 * Provides a function to redirect users to their appropriate dashboard
 * based on their role and stored redirect preferences.
 *
 * @returns {Function} redirectToRoleBasedPath - Function to redirect user
 *
 * Usage:
 * const { redirectToRoleBasedPath } = useRoleBasedRedirect();
 * redirectToRoleBasedPath();
 */
export const useRoleBasedRedirect = () => {
  const { data: userData } = useUser();
  const navigate = useNavigate();

  const redirectToRoleBasedPath = useCallback(() => {
    if (!userData?.user) {
      console.warn("🚫 Cannot redirect: User not authenticated");
      return;
    }

    const userRole = userData.user.role;

    // Get comprehensive role-based redirect path
    const redirectPath = getRoleBasedRedirectPathAfterLogin(userRole);

    // Navigate to the appropriate path
    navigate(redirectPath, { replace: true });
  }, [userData, navigate]);

  return {
    redirectToRoleBasedPath,
  };
};

export default useRoleBasedRedirect;
