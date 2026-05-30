import ax, { AxiosError } from "axios";

export const environment = process.env.NODE_ENV as "production" | "development";
export type ErrorWithMessage = AxiosError<WithMessage>;
export interface WithMessage {
  message: string;
}

export interface ApiResponse<T = {}> {
  data: null | undefined | T;
  message: string;
}

const sanitizeDomain = (domain: string) => {
  // if (domain.at(-1) === "/")
  //   throw new Error(
  //     "Invalid domain format \n valid domains:\nhttps://www.example.com\nhttp://localhost:3000"
  //   );
  // return domain.at(-1) === "/" ? domain.slice(0, -1) + "/api" : domain + "/api";

  // Remove trailing slash if present
  const cleanDomain = domain.endsWith("/") ? domain.slice(0, -1) : domain;

  // Add /api to the domain
  return cleanDomain + "/api";
};
// deployment issue solving
export const backendDomain =
  import.meta.env.VITE_BACKEND_DOMAIN || "http://localhost:3000";
// Export as backendURL for Better Auth (needs base URL without /api)
export const backendURL = backendDomain;
export const url = sanitizeDomain(backendDomain);

export const axios = ax.create({
  baseURL: url,
  withCredentials: true,
});

// Track if user is logging out to prevent new requests
let isLoggingOut = false;

export const setLoggingOut = (value: boolean) => {
  isLoggingOut = value;
};

// Add request interceptor to block requests during logout
axios.interceptors.request.use(
  (config) => {
    if (isLoggingOut) {
      return Promise.reject(new Error("User is logging out"));
    }
    // Prevent browser HTTP cache from returning 304 on GET requests
    if (!config.method || config.method.toLowerCase() === "get") {
      config.headers["Cache-Control"] = "no-cache";
      config.headers["Pragma"] = "no-cache";
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle authentication errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Skip interceptor for logout requests to prevent page reload
    if (
      error.config?.url?.includes("/auth/sign-out") ||
      error.config?.url?.includes("/auth/signout")
    ) {
      return Promise.reject(error);
    }

    // Don't process errors if user is logging out
    if (isLoggingOut) {
      return Promise.reject(error);
    }

    // Handle specific sub admin deactivation error
    if (
      error.response?.status === 403 &&
      error.response?.data?.code === "SUBADMIN_DEACTIVATED"
    ) {
      // Force logout if sub admin is deactivated
      localStorage.removeItem("auth-token");
      localStorage.removeItem("user-session");

      // Redirect to login with specific message
      window.location.href = "/auth/signin?message=deactivated";
    }

    // Handle unauthorized access (401) without aggressively clearing auth state.
    // Some endpoints can return transient 401/403 responses that should not force logout.
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes("/auth/sign-out") &&
      !error.config?.url?.includes("/auth/signout")
    ) {
      // Intentionally no automatic local session clearing here.
      // Let auth/session checks drive logout behavior explicitly.
    }

    return Promise.reject(error);
  }
);
