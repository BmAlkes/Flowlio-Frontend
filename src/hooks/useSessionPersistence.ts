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
    // Don't store public routes (home, pricing, workflow, insights, auth pages)
    if (!isLoading && userData?.user) {
      const publicRoutes = [
        "/",
        "/pricing",
        "/workflow",
        "/insights",
        "/privacy-policy",
        "/terms-of-service",
      ];
      const isAuthRoute = location.pathname.startsWith("/auth");

      // Only store protected routes, not public routes
      if (!publicRoutes.includes(location.pathname) && !isAuthRoute) {
        storeLastVisitedPage(location.pathname);
      }
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

      // Define public routes where users should be allowed to stay
      const publicRoutes = [
        "/",
        "/pricing",
        "/workflow",
        "/insights",
        "/privacy-policy",
        "/terms-of-service",
      ];

      // Don't redirect if user is on a public route - let them stay there
      // Only redirect from home page if they have a last visited protected route
      if (
        currentPath === "/" &&
        lastVisited &&
        !publicRoutes.includes(lastVisited)
      ) {
        console.log(
          "🔄 Restoring session - redirecting from",
          currentPath,
          "to",
          lastVisited
        );
        navigate(lastVisited, { replace: true });
      } else if (currentPath === "/" && !lastVisited) {
        // If no last visited page, don't force redirect - let user stay on home page
        // Only redirect to dashboard if user explicitly navigates to protected routes
        console.log("🔄 No last visited page - user can stay on home page");
        // Don't redirect - let user stay on home page
      }
      // If user is on any other public route, let them stay there
    }
  }, [userData?.user, isLoading, navigate, location.pathname]);
};
