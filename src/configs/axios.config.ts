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
    // Block all requests if user is logging out
    if (isLoggingOut) {
      return Promise.reject(new Error("User is logging out"));
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

    // Handle unauthorized access (401) - session expired or invalid
    // But only if it's not a logout request
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes("/auth/sign-out") &&
      !error.config?.url?.includes("/auth/signout")
    ) {
      // Clear any stored auth data
      localStorage.removeItem("auth-token");
      localStorage.removeItem("user-session");

      // Redirect to login
      // window.location.href = "/auth/signin?message=session_expired";
    }

    return Promise.reject(error);
  }
);
