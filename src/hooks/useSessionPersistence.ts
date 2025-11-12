import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useUser } from "@/providers/user.provider";
import {
  storeLastVisitedPage,
  getLastVisitedPage,
} from "@/utils/sessionPersistence.util";

/**
 * Hook to track the last visited page for session persistence
 * This should be used in the main app component or layout
 */
export const useSessionPersistence = () => {
  const location = useLocation();
  const { data: userData, isLoading } = useUser();

  useEffect(() => {
    // Only store page visits for authenticated users
    if (!isLoading && userData?.user) {
      storeLastVisitedPage(location.pathname);
    }
  }, [location.pathname, userData?.user, isLoading]);
};

/**
 * Hook to handle session restoration on app load
 * This checks if user has an active session and redirects appropriately
 */
export const useSessionRestoration = () => {
  const { data: userData, isLoading } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && userData?.user) {
      // User is authenticated - check if they should be redirected
      const lastVisited = getLastVisitedPage();
      const currentPath = location.pathname;

      // If user is on home page or root, redirect to last visited page
      if (currentPath === "/" && lastVisited) {
        console.log(
          "🔄 Restoring session - redirecting from",
          currentPath,
          "to",
          lastVisited
        );
        navigate(lastVisited, { replace: true });
      } else if (currentPath === "/" && !lastVisited) {
        // If no last visited page, redirect to dashboard
        console.log("🔄 No last visited page - redirecting to dashboard");
        navigate("/dashboard", { replace: true });
      }
    }
  }, [userData?.user, isLoading, navigate, location.pathname]);
};
