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
  import.meta.env.VITE_BACKEND_DOMAIN ||
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:3000";
export const url = sanitizeDomain(backendDomain);

// Export backend URL for direct use (without /api suffix)
export const backendURL =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_BACKEND_DOMAIN ||
  "http://localhost:3000";

export const axios = ax.create({
  baseURL: url,
  withCredentials: true,
});

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

    // Handle organization deactivation errors (403)
    if (error.response?.status === 403) {
      const errorCode = error.response?.data?.code;
      const errorMessage = error.response?.data?.message;

      // Handle sub admin deactivation
      if (errorCode === "SUBADMIN_DEACTIVATED") {
        // Force logout if sub admin is deactivated
        localStorage.removeItem("auth-token");
        localStorage.removeItem("user-session");
        // Redirect to login with specific message
        window.location.href = "/auth/signin?message=deactivated";
        return Promise.reject(error);
      }

      // Handle organization/demo account deactivation
      if (errorCode === "ORGANIZATION_DEACTIVATED") {
        // Store error message in sessionStorage to display on sign-in page
        if (errorMessage) {
          sessionStorage.setItem("deactivationError", errorMessage);
        }
        // Force logout
        localStorage.removeItem("auth-token");
        localStorage.removeItem("user-session");
        // Redirect to login
        window.location.href = "/auth/signin?message=organization_deactivated";
        return Promise.reject(error);
      }

      // Handle trial expired
      if (errorCode === "TRIAL_EXPIRED") {
        if (errorMessage) {
          sessionStorage.setItem("trialExpiredError", errorMessage);
        }
        localStorage.removeItem("auth-token");
        localStorage.removeItem("user-session");
        window.location.href = "/auth/signin?message=trial_expired";
        return Promise.reject(error);
      }

      // Handle payment pending
      if (errorCode === "PAYMENT_PENDING") {
        if (errorMessage) {
          sessionStorage.setItem("paymentPendingError", errorMessage);
        }
        localStorage.removeItem("auth-token");
        localStorage.removeItem("user-session");
        window.location.href = "/auth/signin?message=payment_pending";
        return Promise.reject(error);
      }

      // Handle user pending (account not activated)
      // Don't log out - redirect to checkout to complete payment
      if (errorCode === "USER_PENDING") {
        const pendingData = error.response?.data?.data;
        if (errorMessage) {
          sessionStorage.setItem("paymentPendingError", errorMessage);
        }
        // Store pending payment data
        if (pendingData) {
          sessionStorage.setItem(
            "pendingPaymentData",
            JSON.stringify(pendingData)
          );
        }
        // Redirect to checkout instead of sign-in
        window.location.href = "/checkout?pending=true";
        return Promise.reject(error);
      }
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
