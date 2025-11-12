/**
 * Session Persistence Utility
 * Handles storing and retrieving the last visited page for redirect after login
 */

const LAST_VISITED_KEY = "flowlio_last_visited_page";
const REDIRECT_FROM_KEY = "flowlio_redirect_from";

/**
 * Store the current page as the last visited page
 * This should be called when navigating to any protected route
 */
export const storeLastVisitedPage = (pathname: string): void => {
  try {
    // Don't store auth pages or root as last visited
    if (pathname.startsWith("/auth") || pathname === "/" || pathname === "") {
      return;
    }

    localStorage.setItem(LAST_VISITED_KEY, pathname);
  } catch (error) {
    console.error("Error storing last visited page:", error);
  }
};

/**
 * Get the last visited page
 */
export const getLastVisitedPage = (): string | null => {
  try {
    const lastVisited = localStorage.getItem(LAST_VISITED_KEY);
    return lastVisited;
  } catch (error) {
    console.error("Error retrieving last visited page:", error);
    return null;
  }
};

/**
 * Clear the last visited page (call on logout)
 */
export const clearLastVisitedPage = (): void => {
  try {
    localStorage.removeItem(LAST_VISITED_KEY);
    localStorage.removeItem(REDIRECT_FROM_KEY);
  } catch (error) {
    console.error("Error clearing last visited page:", error);
  }
};

/**
 * Store redirect information from ProtectedRoute
 */
export const storeRedirectFrom = (pathname: string): void => {
  try {
    localStorage.setItem(REDIRECT_FROM_KEY, pathname);
  } catch (error) {
    console.error("Error storing redirect from:", error);
  }
};

/**
 * Get redirect information and clear it
 */
export const getAndClearRedirectFrom = (): string | null => {
  try {
    const redirectFrom = localStorage.getItem(REDIRECT_FROM_KEY);
    if (redirectFrom) {
      localStorage.removeItem(REDIRECT_FROM_KEY);
    }
    return redirectFrom;
  } catch (error) {
    console.error("Error retrieving redirect from:", error);
    return null;
  }
};

/**
 * Get the appropriate redirect path after login based on user role
 * Priority: redirect from ProtectedRoute > last visited page > role-based dashboard
 */
// Validate whether a path is accessible for a given role
const isPathAccessibleForRole = (path: string, userRole?: string): boolean => {
  if (!path) return false;
  if (path.startsWith("/superadmin")) return userRole === "superadmin";
  if (path.startsWith("/viewer")) return userRole === "viewer";
  if (path.startsWith("/dashboard"))
    return ["user", "subadmin", "operator"].includes(userRole || "");
  if (path.startsWith("/auth") || path === "/") return true;
  return false;
};

export const getRoleBasedRedirectPathAfterLogin = (
  userRole?: string,
  validateAccess: boolean = true
): string => {
  const redirectFrom = getAndClearRedirectFrom();
  if (redirectFrom) {
    if (!validateAccess || isPathAccessibleForRole(redirectFrom, userRole)) {
      return redirectFrom;
    }
  }

  const lastVisited = getLastVisitedPage();
  if (lastVisited) {
    if (!validateAccess || isPathAccessibleForRole(lastVisited, userRole)) {
      return lastVisited;
    }
  }

  // Default to role-based dashboard
  let defaultPath = "/dashboard";
  switch (userRole) {
    case "superadmin":
      defaultPath = "/superadmin";
      break;
    case "viewer":
      defaultPath = "/viewer";
      break;
    case "subadmin":
    case "operator":
      defaultPath = "/dashboard";
      break;
    case "user":
    default:
      defaultPath = "/dashboard";
      break;
  }

  return defaultPath;
};

/**
 * Get the appropriate redirect path after login
 * Priority: redirect from ProtectedRoute > last visited page > dashboard
 */
export const getRedirectPathAfterLogin = (): string => {
  const redirectFrom = getAndClearRedirectFrom();
  const lastVisited = getLastVisitedPage();

  // Priority order: redirect from ProtectedRoute > last visited > dashboard
  const redirectPath = redirectFrom || lastVisited || "/dashboard";

  return redirectPath;
};

/**
 * Check if user should be redirected to a specific page
 * Returns true if there's a stored redirect path
 */
export const shouldRedirectAfterLogin = (): boolean => {
  const redirectFrom = localStorage.getItem(REDIRECT_FROM_KEY);
  const lastVisited = localStorage.getItem(LAST_VISITED_KEY);

  return !!(redirectFrom || lastVisited);
};
