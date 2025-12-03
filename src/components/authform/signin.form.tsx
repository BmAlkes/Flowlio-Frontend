import {
  Form,
  FormItem,
  FormLabel,
  FormField,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormWrapper } from "./formwrapper";
import { useNavigate, useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import { Anchor } from "../ui/anchor";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Flex } from "../ui/flex";
import { useState, useEffect } from "react";
import { authClient } from "@/providers/user.provider";
import { axios } from "@/configs/axios.config";
import type { FC } from "react";
import { z } from "zod";
import { Box } from "../ui/box";
import { toast } from "sonner";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { RefreshCw } from "lucide-react";
import { getRoleBasedRedirectPathAfterLogin } from "@/utils/sessionPersistence.util";
import { useUser } from "@/providers/user.provider";

const formSchema = z.object({
  password: z
    .string()
    .min(8, "Invalid Password")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    ),
  email: z
    .string()
    .email({ message: "Invalid Email" })
    .min(1, { message: "Required field" })
    .max(50, { message: "Maximum 50 characters are allowed" }),
  rememberMe: z.boolean(),
});

export const SignInForm: FC = () => {
  useEffect(() => {
    scrollTo(0, 0);
    document.title = "Sign In - Flowlio";
  }, []);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { refetchUser } = useUser();

  // Check for deactivation message in URL params and sessionStorage
  useEffect(() => {
    const message = searchParams.get("message");

    // Check sessionStorage for error messages
    const deactivationError = sessionStorage.getItem("deactivationError");
    const trialExpiredError = sessionStorage.getItem("trialExpiredError");
    const paymentPendingError = sessionStorage.getItem("paymentPendingError");
    const userPendingError = sessionStorage.getItem("userPendingError");

    if (deactivationError) {
      toast.error(deactivationError);
      setError(deactivationError);
      sessionStorage.removeItem("deactivationError");
    } else if (trialExpiredError) {
      toast.error(trialExpiredError);
      setError(trialExpiredError);
      sessionStorage.removeItem("trialExpiredError");
    } else if (paymentPendingError) {
      toast.error(paymentPendingError);
      setError(paymentPendingError);
      sessionStorage.removeItem("paymentPendingError");
    } else if (userPendingError) {
      toast.error(userPendingError);
      setError(userPendingError);
      sessionStorage.removeItem("userPendingError");
    } else if (message === "deactivated") {
      toast.error(
        "Your account has been deactivated. Please contact the administrator for assistance."
      );
      setError(
        "Your account has been deactivated. Please contact the administrator for assistance."
      );
    } else if (message === "organization_deactivated") {
      const errorMsg =
        "Your organization account has been deactivated. Please contact the administrator for assistance.";
      toast.error(errorMsg);
      setError(errorMsg);
    } else if (message === "trial_expired") {
      const errorMsg =
        "Your trial period has expired. Please contact the administrator to upgrade your subscription.";
      toast.error(errorMsg);
      setError(errorMsg);
    } else if (message === "payment_pending") {
      const errorMsg =
        "Your subscription is pending payment. Please complete your payment to access your account.";
      toast.error(errorMsg);
      setError(errorMsg);
    } else if (message === "user_pending") {
      const errorMsg =
        "Your account is pending payment. Please complete your payment to access your account.";
      toast.error(errorMsg);
      setError(errorMsg);
    }
  }, [searchParams]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rememberMe: true,
      password: "",
      email: "",
    },
  });

  const onSubmit = async ({ email, password }: z.infer<typeof formSchema>) => {
    authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onRequest: () => {
          setIsLoading(true);
        },
        onSuccess: async () => {
          setError(null);

          try {
            // Wait for Better Auth session to be established
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Check if user has 2FA enabled by fetching profile
            const profileResponse = await axios.get("/user/profile");

            // Check if organization is deactivated, trial expired, or user is pending
            // NOTE: USER_PENDING should redirect to checkout, not log out
            if (profileResponse.status === 403) {
              const errorCode = profileResponse.data?.code;
              const errorData = profileResponse.data?.data;

              // Handle pending users - redirect to checkout
              if (
                errorCode === "USER_PENDING" ||
                errorCode === "USER_PENDING_NO_PLAN"
              ) {
                const errorMessage =
                  typeof profileResponse.data?.message === "string"
                    ? profileResponse.data.message
                    : "Your account is pending payment. Please complete your payment to access your account.";

                toast.info(errorMessage);

                // Refresh user context first
                await refetchUser();

                // Redirect to checkout if user has payment data, otherwise to pricing
                if (
                  errorCode === "USER_PENDING" &&
                  (errorData?.selectedPlanId ||
                    errorData?.pendingOrganizationData)
                ) {
                  navigate("/checkout", {
                    state: {
                      pendingPayment: true,
                      selectedPlanId: errorData?.selectedPlanId,
                      pendingOrganizationData:
                        errorData?.pendingOrganizationData,
                    },
                    replace: true,
                  });
                } else {
                  navigate("/pricing", {
                    state: {
                      fromSignin: true,
                      pendingAccount: true,
                    },
                    replace: true,
                  });
                }

                setIsLoading(false);
                return;
              }

              // Handle organization deactivated or trial expired
              if (
                errorCode === "ORGANIZATION_DEACTIVATED" ||
                errorCode === "TRIAL_EXPIRED"
              ) {
                const errorMessage =
                  typeof profileResponse.data?.message === "string"
                    ? profileResponse.data.message
                    : "Access denied. Please contact the administrator for assistance.";
                toast.error(errorMessage);

                // Log out the user session that was created
                try {
                  await authClient.signOut();
                } catch (error) {
                  console.error("Error signing out:", error);
                }

                setIsLoading(false);
                return;
              }
            }

            const userProfile = profileResponse.data?.data;

            // If profile response failed, log and continue
            if (!userProfile) {
              console.error(
                "❌ No user profile data received:",
                profileResponse
              );
              setIsLoading(false);
              return;
            }

            // Debug: Log user profile to see what we're getting
            console.log("🔍 User Profile on Sign-in:", {
              status: userProfile.status,
              statusType: typeof userProfile.status,
              selectedPlanId: userProfile.selectedPlanId,
              pendingOrganizationData: userProfile.pendingOrganizationData,
              twoFactorEnabled: userProfile.twoFactorEnabled,
              isSuperAdmin: userProfile.isSuperAdmin,
              fullProfile: userProfile,
              profileResponseKeys: Object.keys(profileResponse.data || {}),
            });

            // Check if user has 2FA enabled
            if (userProfile.twoFactorEnabled) {
              // Store email for OTP verification
              sessionStorage.setItem("otpEmail", email);
              setIsLoading(false);

              // Redirect to OTP verification page
              navigate("/auth/signin-otp", { replace: true });
              return;
            }

            // Skip pending payment check for:
            // 1. Super admins (they don't need payment)
            // 2. Sub admins (they don't need payment)
            // 3. Demo users (users in demo organizations don't need payment)
            const isSuperAdmin = userProfile.isSuperAdmin === true;
            const isSubAdmin =
              userProfile.role === "subadmin" || !!userProfile.subadminId;
            const isDemoUser =
              userProfile.demoOrgInfo !== null &&
              userProfile.demoOrgInfo !== undefined;

            // Also check if user has an organization with demo settings
            // This handles cases where demoOrgInfo might not be set but the org is demo
            const hasDemoOrganization =
              userProfile.organization?.settings?.demo === true ||
              (userProfile.organization &&
                typeof userProfile.organization.settings === "object" &&
                (userProfile.organization.settings as any)?.demo === true);

            const shouldSkipPaymentCheck =
              isSuperAdmin || isSubAdmin || isDemoUser || hasDemoOrganization;

            // Log the check results for debugging
            console.log("🔍 Payment check skip evaluation:", {
              isSuperAdmin,
              isSubAdmin,
              isDemoUser,
              hasDemoOrganization,
              shouldSkipPaymentCheck,
              demoOrgInfo: userProfile.demoOrgInfo,
              organizationSettings: userProfile.organization?.settings,
              userStatus: userProfile.status,
            });

            // Check if user is pending (needs to complete payment or select a plan)
            // Only apply to regular users (not super admins, sub admins, or demo users)
            // IMPORTANT: If shouldSkipPaymentCheck is true, we skip ALL payment checks
            if (!shouldSkipPaymentCheck) {
              // Check status case-insensitively and handle different formats
              const rawStatus = userProfile.status;
              const userStatus = rawStatus?.toLowerCase?.() || rawStatus || "";

              // A user is considered pending if:
              // 1. Status is explicitly "pending" (regardless of payment data)
              // 2. Status is null/undefined (new users or users created before status field was added)
              //    - These users need to complete payment to activate their account
              const isPending =
                userStatus === "pending" ||
                !rawStatus ||
                rawStatus === null ||
                rawStatus === undefined;

              const hasPaymentData = !!(
                userProfile.selectedPlanId ||
                userProfile.pendingOrganizationData
              );

              console.log("🔍 Checking user status:", {
                rawStatus: rawStatus,
                normalizedStatus: userStatus,
                isPending: isPending,
                selectedPlanId: userProfile.selectedPlanId,
                pendingOrganizationData: userProfile.pendingOrganizationData,
                hasPaymentData: hasPaymentData,
                willRedirect: isPending,
                isSuperAdmin: isSuperAdmin,
                isSubAdmin: isSubAdmin,
                isDemoUser: isDemoUser,
                hasDemoOrganization: hasDemoOrganization,
                demoOrgInfo: userProfile.demoOrgInfo,
                organization: userProfile.organization,
                shouldSkipPaymentCheck: shouldSkipPaymentCheck,
              });

              if (isPending) {
                console.log("✅ Pending user detected, redirecting...");

                // Check if user has payment data (can complete payment)
                if (
                  userProfile.selectedPlanId ||
                  userProfile.pendingOrganizationData
                ) {
                  console.log(
                    "✅ User has payment data, redirecting to checkout"
                  );

                  // User has pending payment, redirect to checkout
                  toast.info(
                    "Please complete your payment to activate your account"
                  );

                  // Refresh user context first
                  await refetchUser();

                  // Redirect to checkout with pending payment info
                  navigate("/checkout", {
                    state: {
                      selectedPlan: null, // Will be determined in checkout
                      createOrganization: true,
                      pendingPayment: true,
                      selectedPlanId: userProfile.selectedPlanId,
                      pendingOrganizationData:
                        userProfile.pendingOrganizationData,
                    },
                    replace: true,
                  });
                  setIsLoading(false);
                  return; // IMPORTANT: Return early to prevent further execution
                } else {
                  console.log(
                    "✅ User has no payment data, redirecting to pricing"
                  );

                  // User is pending but has no payment data - redirect to pricing to select a plan
                  toast.info(
                    "Please select a plan and complete payment to activate your account"
                  );

                  // Refresh user context first
                  await refetchUser();

                  navigate("/pricing", {
                    state: {
                      fromSignin: true,
                      pendingAccount: true,
                    },
                    replace: true,
                  });
                  setIsLoading(false);
                  return; // IMPORTANT: Return early to prevent further execution
                }
              } else {
                // User is not pending, continue with normal login flow
                console.log(
                  "✅ User is not pending, continuing with normal login flow"
                );
              }
            } else {
              // User is super admin, sub admin, or demo user - skip payment check
              console.log("✅ User is admin/demo - skipping payment check:", {
                isSuperAdmin: isSuperAdmin,
                isSubAdmin: isSubAdmin,
                isDemoUser: isDemoUser,
                hasDemoOrganization: hasDemoOrganization,
                shouldSkipPaymentCheck: shouldSkipPaymentCheck,
                demoOrgInfo: userProfile.demoOrgInfo,
                organization: userProfile.organization,
                fullUserProfile: userProfile,
              });

              // IMPORTANT: For demo users, even if they have pending status or payment data,
              // we should NOT redirect them to checkout. They should proceed to dashboard.
              // This ensures demo accounts work correctly regardless of their status.
            }

            // Show success message
            toast.success("Login successful");

            // Get comprehensive role-based redirect path
            const redirectPath = getRoleBasedRedirectPathAfterLogin(
              userProfile.role
            );

            // Refresh user context to avoid stale state, then client-side navigate
            await refetchUser();
            navigate(redirectPath, { replace: true });
          } catch (error) {
            // Check if organization is deactivated, trial expired, or payment pending
            if ((error as any).response?.status === 403) {
              const errorCode = (error as any).response?.data?.code;
              const errorData = (error as any).response?.data?.data;
              const errorMessage =
                (error as any).response?.data?.message ||
                "Access denied. Please contact the administrator for assistance.";

              // Handle pending users - redirect to checkout instead of logging out
              if (
                errorCode === "USER_PENDING" ||
                errorCode === "USER_PENDING_NO_PLAN"
              ) {
                toast.info(errorMessage);

                // Refresh user context first
                await refetchUser();

                // Redirect to checkout if user has payment data, otherwise to pricing
                if (
                  errorCode === "USER_PENDING" &&
                  (errorData?.selectedPlanId ||
                    errorData?.pendingOrganizationData)
                ) {
                  navigate("/checkout", {
                    state: {
                      pendingPayment: true,
                      selectedPlanId: errorData?.selectedPlanId,
                      pendingOrganizationData:
                        errorData?.pendingOrganizationData,
                    },
                    replace: true,
                  });
                } else {
                  navigate("/pricing", {
                    state: {
                      fromSignin: true,
                      pendingAccount: true,
                    },
                    replace: true,
                  });
                }

                setIsLoading(false);
                return;
              }

              // Handle other 403 errors (organization deactivated, trial expired, etc.)
              if (
                errorCode === "ORGANIZATION_DEACTIVATED" ||
                errorCode === "TRIAL_EXPIRED" ||
                errorCode === "PAYMENT_PENDING"
              ) {
                toast.error(errorMessage);

                // Log out the user session that was created
                try {
                  await authClient.signOut();
                } catch (error) {
                  console.error("Error signing out:", error);
                  // Error signing out - silently fail
                }

                setIsLoading(false);
                return;
              }
            }

            // Check if it's a 401 error (unauthorized) - might indicate 2FA is required
            if ((error as any).response?.status === 401) {
              // Store email for OTP verification
              sessionStorage.setItem("otpEmail", email);

              // Redirect to OTP verification page
              navigate("/auth/signin-otp", { replace: true });
              return;
            }

            // Still redirect but show warning
            toast.warning(
              "Login successful, but some data may not be available yet"
            );

            // Fallback to default dashboard if profile fetch fails
            navigate("/dashboard", { replace: true });
          }
        },
        onError: async (ctx) => {
          setIsLoading(false);

          // Log full error structure for debugging
          console.log("Sign-in error:", ctx.error);
          console.log("Error structure:", {
            message: ctx.error?.message,
            code: (ctx.error as any)?.code,
            data: (ctx.error as any)?.data,
            response: (ctx.error as any)?.response,
            statusCode: (ctx.error as any)?.statusCode,
            status: (ctx.error as any)?.status,
            cause: (ctx.error as any)?.cause,
            stack: (ctx.error as any)?.stack,
            fullError: ctx.error,
            errorString: JSON.stringify(ctx.error),
          });

          // EARLY CHECK: Look for trial expiration in the error immediately
          // This catches it before any other processing
          const errorString = JSON.stringify(ctx.error || {});
          const errorStack = (ctx.error as any)?.stack || "";
          const errorMessage1 = (ctx.error as any)?.message || "";
          const causeMessage = (ctx.error as any)?.cause?.message || "";
          const causeDataMessage =
            (ctx.error as any)?.cause?.data?.message || "";
          const causeDataCode = (ctx.error as any)?.cause?.data?.code || "";
          const causeCode = (ctx.error as any)?.cause?.code || "";

          // Check all possible locations for trial expiration
          const allErrorText = [
            errorString,
            errorStack,
            errorMessage1,
            causeMessage,
            causeDataMessage,
            causeDataCode,
            causeCode,
          ]
            .join(" ")
            .toLowerCase();

          console.log("🔍 Early error check:", {
            hasTrialExpired: allErrorText.includes("trial period has expired"),
            hasDemoAccount: allErrorText.includes("demo account"),
            errorString: errorString.substring(0, 500), // First 500 chars
            errorStack: errorStack.substring(0, 500), // First 500 chars
            causeMessage,
            causeDataMessage,
            causeCode,
            causeDataCode,
          });

          if (
            allErrorText.includes("trial period has expired") ||
            causeCode === "TRIAL_EXPIRED" ||
            causeDataCode === "TRIAL_EXPIRED"
          ) {
            console.log("✅ Trial expiration detected early!");
            const isDemo = allErrorText.includes("demo account");
            const displayMessage = isDemo
              ? "This demo account's trial period has expired. Please contact the administrator for assistance."
              : "Your trial period has expired. Please contact the administrator to upgrade your subscription.";
            toast.error(displayMessage);
            setError(displayMessage);
            return;
          }

          // Helper function to safely extract string from value
          const extractString = (value: any): string => {
            if (!value) return "";
            if (typeof value === "string") return value;
            if (typeof value === "object") {
              // If it's an object, try to get message property or stringify it
              if (value.message && typeof value.message === "string") {
                return value.message;
              }
              // Try to stringify, but avoid circular references
              try {
                const str = JSON.stringify(value);
                // If it's just "{}" or "[object Object]", return empty
                if (str === "{}" || str === '"[object Object]"') return "";
                return str;
              } catch {
                return "";
              }
            }
            return String(value);
          };

          // Extract error message from various possible locations
          // Better Auth might wrap errors in different structures, so check all possible locations
          // Check stack trace first for detailed error messages (Better Auth often puts the real error here)
          let stackMessage = "";
          if (typeof (ctx.error as any)?.stack === "string") {
            const stack = (ctx.error as any).stack;

            // First, try to extract from the first line which usually contains the full error message
            const firstLine = stack.split("\n")[0];
            // Pattern: Error: <full message>
            const firstLineMatch = firstLine.match(
              /Error:\s*(.+?)(?:\s+at\s|$)/
            );
            if (firstLineMatch && firstLineMatch[1]) {
              const extracted = firstLineMatch[1].trim();
              // Check if it contains our custom error messages
              if (
                extracted.includes("trial period has expired") ||
                extracted.includes("demo account") ||
                extracted.includes("deactivated") ||
                extracted.includes("pending payment")
              ) {
                stackMessage = extracted;
              }
            }

            // If not found in first line, search all lines
            if (!stackMessage) {
              const stackLines = stack.split("\n");
              for (const line of stackLines) {
                // Check if line contains our custom error messages
                if (
                  line.includes("trial period has expired") ||
                  line.includes("demo account") ||
                  line.includes("deactivated") ||
                  line.includes("pending payment")
                ) {
                  // Extract the message part (usually after "Error: ")
                  const match = line.match(/Error:\s*(.+)/);
                  if (match && match[1]) {
                    stackMessage = match[1].trim();
                    break;
                  }
                  // Also try to extract just the message part if it's in the line
                  const messageMatch = line.match(
                    /(?:trial period has expired|demo account|deactivated|pending payment)[^.]*/i
                  );
                  if (messageMatch) {
                    stackMessage = messageMatch[0].trim();
                    break;
                  }
                }
              }
            }
          }

          const errorMessage =
            extractString(ctx.error?.message) ||
            extractString((ctx.error as any)?.data?.message) ||
            extractString((ctx.error as any)?.response?.data?.message) ||
            extractString((ctx.error as any)?.response?.data?.error?.message) ||
            extractString((ctx.error as any)?.response?.message) ||
            extractString((ctx.error as any)?.cause?.message) ||
            extractString((ctx.error as any)?.statusText) || // Better Auth sometimes puts error in statusText
            // Check for error in Better Auth's wrapped structure (for 500 errors)
            extractString((ctx.error as any)?.cause?.data?.message) ||
            extractString((ctx.error as any)?.cause?.data?.error?.message) ||
            stackMessage || // Use extracted stack message
            "";

          // Extract error code from various possible locations
          const errorCode =
            (ctx.error as any)?.code ||
            (ctx.error as any)?.data?.code ||
            (ctx.error as any)?.response?.data?.code ||
            (ctx.error as any)?.response?.data?.error?.code ||
            // Check for error code in Better Auth's wrapped structure (for 500 errors)
            (ctx.error as any)?.cause?.code ||
            (ctx.error as any)?.cause?.data?.code ||
            (ctx.error as any)?.statusCode ||
            (ctx.error as any)?.response?.status;

          // Ensure errorMessage is always a string (not an object)
          // If errorMessage is empty or just an object representation, use a default
          let safeErrorMessage = "";
          if (
            errorMessage &&
            errorMessage !== "" &&
            errorMessage !== "{}" &&
            !errorMessage.includes("[object Object]") &&
            !errorMessage.toLowerCase().includes("internal server error")
          ) {
            safeErrorMessage = errorMessage;
          } else if (stackMessage) {
            // Use stack message if available and regular error message is empty or generic
            safeErrorMessage = stackMessage;
          } else if (
            (ctx.error as any)?.status === 500 ||
            (ctx.error as any)?.statusText
          ) {
            // Better Auth 500 error - check if we can get more info
            // For pending users, we'll handle this in onSuccess instead
            safeErrorMessage = "";
          }

          // If we have a 500 error from Better Auth, check if it's a wrapped error
          // Better Auth sometimes wraps our custom errors (TRIAL_EXPIRED, ORGANIZATION_DEACTIVATED, etc.) as 500
          if (
            (ctx.error as any)?.status === 500 ||
            (ctx.error as any)?.statusCode === 500
          ) {
            console.log(
              "🔍 Better Auth 500 error - checking for wrapped error codes...",
              {
                error: ctx.error,
                errorCode,
                errorMessage: safeErrorMessage,
                cause: (ctx.error as any)?.cause,
                stack: (ctx.error as any)?.stack,
              }
            );

            // Check if the error code/message is in the wrapped structure
            // Better Auth wraps errors in cause.data
            const wrappedErrorCode =
              (ctx.error as any)?.cause?.code ||
              (ctx.error as any)?.cause?.data?.code;
            const wrappedErrorMessage =
              extractString((ctx.error as any)?.cause?.data?.message) ||
              extractString((ctx.error as any)?.cause?.message) ||
              safeErrorMessage || // Also check the already extracted message
              stackMessage; // Check stack trace message

            // If we found a wrapped error code/message, use it
            if (wrappedErrorCode || wrappedErrorMessage) {
              console.log("✅ Found wrapped error:", {
                code: wrappedErrorCode,
                message: wrappedErrorMessage,
              });

              // Handle trial expired (including demo accounts) - PRIORITY CHECK
              const lowerWrappedMessage = wrappedErrorMessage.toLowerCase();
              if (
                wrappedErrorCode === "TRIAL_EXPIRED" ||
                lowerWrappedMessage.includes("trial period has expired") ||
                lowerWrappedMessage.includes(
                  "demo account's trial period has expired"
                ) ||
                (lowerWrappedMessage.includes("demo account") &&
                  lowerWrappedMessage.includes("expired"))
              ) {
                // Determine if it's a demo account message
                const isDemoMessage =
                  lowerWrappedMessage.includes("demo account");

                const displayMessage =
                  wrappedErrorMessage ||
                  (isDemoMessage
                    ? "This demo account's trial period has expired. Please contact the administrator for assistance."
                    : "Your trial period has expired. Please contact the administrator to upgrade your subscription.");
                toast.error(displayMessage);
                setError(displayMessage);
                return;
              }

              // Handle organization deactivated
              if (
                wrappedErrorCode === "ORGANIZATION_DEACTIVATED" ||
                wrappedErrorMessage.toLowerCase().includes("deactivated")
              ) {
                const displayMessage =
                  wrappedErrorMessage ||
                  "Your organization account has been deactivated. Please contact the administrator for assistance.";
                toast.error(displayMessage);
                setError(displayMessage);
                return;
              }

              // Handle payment pending
              if (
                wrappedErrorCode === "PAYMENT_PENDING" ||
                wrappedErrorMessage.toLowerCase().includes("pending payment")
              ) {
                const displayMessage =
                  wrappedErrorMessage ||
                  "Your subscription is pending payment. Please complete your payment to access your account.";
                toast.error(displayMessage);
                setError(displayMessage);
                return;
              }
            }

            // If no wrapped error found and no clear message, try to check user status (for pending users)
            // Since we now allow pending users to sign in, try to check their status anyway
            if (
              !safeErrorMessage ||
              safeErrorMessage === "" ||
              safeErrorMessage === "{}"
            ) {
              console.log(
                "🔍 No wrapped error found - checking user status..."
              );

              try {
                const profileResponse = await axios.get("/user/profile");
                const userProfile = profileResponse.data?.data;

                if (userProfile?.status === "pending") {
                  // User is pending - redirect appropriately
                  if (
                    userProfile.selectedPlanId ||
                    userProfile.pendingOrganizationData
                  ) {
                    // User has payment data, redirect to checkout
                    toast.info(
                      "Please complete your payment to activate your account"
                    );
                    navigate("/checkout", {
                      state: {
                        pendingPayment: true,
                        selectedPlanId: userProfile.selectedPlanId,
                        pendingOrganizationData:
                          userProfile.pendingOrganizationData,
                      },
                      replace: true,
                    });
                    return;
                  } else {
                    // User has no payment data, redirect to pricing
                    toast.info(
                      "Please select a plan and complete payment to activate your account"
                    );
                    navigate("/pricing", {
                      state: {
                        fromSignin: true,
                        pendingAccount: true,
                      },
                      replace: true,
                    });
                    return;
                  }
                }
              } catch (profileError) {
                console.error("Error checking user profile:", profileError);
                // If we can't check profile, fall through to show generic error
              }

              // If we couldn't determine the issue, check if error message is "Internal Server Error"
              // and try to extract the real error from stack trace
              if (
                safeErrorMessage
                  .toLowerCase()
                  .includes("internal server error") ||
                safeErrorMessage === "" ||
                safeErrorMessage === "{}"
              ) {
                // Try to extract from stack trace one more time with more aggressive parsing
                if (typeof (ctx.error as any)?.stack === "string") {
                  const stack = (ctx.error as any).stack;

                  // Look for trial expiration messages in stack
                  if (stack.includes("trial period has expired")) {
                    // Try to extract the full message - check for demo account first
                    const demoMatch = stack.match(
                      /This demo account's trial period has expired[^.]*/i
                    );
                    if (demoMatch) {
                      toast.error(
                        "This demo account's trial period has expired. Please contact the administrator for assistance."
                      );
                      setError(
                        "This demo account's trial period has expired. Please contact the administrator for assistance."
                      );
                      return;
                    }

                    // Try regular trial expiration message
                    const regularMatch = stack.match(
                      /Your trial period has expired[^.]*/i
                    );
                    if (regularMatch) {
                      toast.error(
                        "Your trial period has expired. Please contact the administrator to upgrade your subscription."
                      );
                      setError(
                        "Your trial period has expired. Please contact the administrator to upgrade your subscription."
                      );
                      return;
                    }

                    // Fallback: check if it contains "demo account" anywhere
                    if (stack.toLowerCase().includes("demo account")) {
                      toast.error(
                        "This demo account's trial period has expired. Please contact the administrator for assistance."
                      );
                      setError(
                        "This demo account's trial period has expired. Please contact the administrator for assistance."
                      );
                      return;
                    } else {
                      // Generic trial expiration
                      toast.error(
                        "Your trial period has expired. Please contact the administrator to upgrade your subscription."
                      );
                      setError(
                        "Your trial period has expired. Please contact the administrator to upgrade your subscription."
                      );
                      return;
                    }
                  }
                }

                // Also check the error message directly in case it's there but we missed it
                const directMessage = extractString(
                  (ctx.error as any)?.message
                );
                if (
                  directMessage &&
                  directMessage.includes("trial period has expired")
                ) {
                  const isDemo = directMessage
                    .toLowerCase()
                    .includes("demo account");
                  const displayMessage = isDemo
                    ? "This demo account's trial period has expired. Please contact the administrator for assistance."
                    : "Your trial period has expired. Please contact the administrator to upgrade your subscription.";
                  toast.error(displayMessage);
                  setError(displayMessage);
                  return;
                }
              }

              // Before showing generic error, do one final check for trial expiration
              // Check the full error object one more time
              const fullErrorString = JSON.stringify(ctx.error);
              if (
                fullErrorString &&
                fullErrorString.includes("trial period has expired")
              ) {
                const isDemo = fullErrorString
                  .toLowerCase()
                  .includes("demo account");
                const displayMessage = isDemo
                  ? "This demo account's trial period has expired. Please contact the administrator for assistance."
                  : "Your trial period has expired. Please contact the administrator to upgrade your subscription.";
                toast.error(displayMessage);
                setError(displayMessage);
                return;
              }

              // FINAL CHECK: Before showing generic error, check one more time for trial expiration
              // This is a last resort check in case we missed it earlier
              const finalErrorCheck = [
                JSON.stringify(ctx.error),
                (ctx.error as any)?.stack || "",
                (ctx.error as any)?.message || "",
                (ctx.error as any)?.cause?.message || "",
                (ctx.error as any)?.cause?.data?.message || "",
                safeErrorMessage,
              ]
                .join(" ")
                .toLowerCase();

              if (finalErrorCheck.includes("trial period has expired")) {
                console.log("✅ Trial expiration detected in final check!");
                const isDemo = finalErrorCheck.includes("demo account");
                const displayMessage = isDemo
                  ? "This demo account's trial period has expired. Please contact the administrator for assistance."
                  : "Your trial period has expired. Please contact the administrator to upgrade your subscription.";
                toast.error(displayMessage);
                setError(displayMessage);
                return;
              }

              // If we couldn't determine the issue, show a generic error
              const finalErrorMessage =
                safeErrorMessage &&
                !safeErrorMessage
                  .toLowerCase()
                  .includes("internal server error")
                  ? safeErrorMessage
                  : "Login failed. Please check your credentials and try again.";
              toast.error(finalErrorMessage);
              setError(finalErrorMessage);
              return;
            }
          }

          // Log extracted values for debugging pending user errors
          if (
            safeErrorMessage.toLowerCase().includes("pending") ||
            errorCode === "USER_PENDING_NO_PLAN" ||
            errorCode === "USER_PENDING"
          ) {
            console.log("🔍 Pending user error detected:", {
              errorMessage: safeErrorMessage,
              errorCode,
              fullError: ctx.error,
            });
          }

          // Check for organization deactivation error
          const isDeactivated =
            errorCode === "ORGANIZATION_DEACTIVATED" ||
            errorCode === 403 ||
            safeErrorMessage.toLowerCase().includes("deactivated") ||
            safeErrorMessage
              .toLowerCase()
              .includes("demo account has been deactivated") ||
            safeErrorMessage
              .toLowerCase()
              .includes("organization account has been deactivated");

          if (isDeactivated) {
            // Show the specific error message from backend
            const displayMessage =
              safeErrorMessage ||
              "Your organization account has been deactivated. Please contact the administrator for assistance.";
            toast.error(displayMessage);
            setError(displayMessage);
            return;
          }

          // Handle trial expired error (including demo accounts)
          // Check this BEFORE other error handlers to ensure we catch it
          const lowerSafeMessage = safeErrorMessage.toLowerCase();
          if (
            errorCode === "TRIAL_EXPIRED" ||
            lowerSafeMessage.includes("trial period has expired") ||
            lowerSafeMessage.includes(
              "demo account's trial period has expired"
            ) ||
            (lowerSafeMessage.includes("demo account") &&
              lowerSafeMessage.includes("expired"))
          ) {
            // Determine if it's a demo account message
            const isDemoMessage = lowerSafeMessage.includes("demo account");

            // Use the exact message from backend (which includes demo account specific message)
            const displayMessage =
              safeErrorMessage ||
              (isDemoMessage
                ? "This demo account's trial period has expired. Please contact the administrator for assistance."
                : "Your trial period has expired. Please contact the administrator to upgrade your subscription.");
            toast.error(displayMessage);
            setError(displayMessage);
            return;
          }

          // Also check the full error object string representation
          const fullErrorStr = JSON.stringify(ctx.error);
          if (
            fullErrorStr &&
            fullErrorStr.includes("trial period has expired")
          ) {
            const isDemo = fullErrorStr.toLowerCase().includes("demo account");
            const displayMessage = isDemo
              ? "This demo account's trial period has expired. Please contact the administrator for assistance."
              : "Your trial period has expired. Please contact the administrator to upgrade your subscription.";
            toast.error(displayMessage);
            setError(displayMessage);
            return;
          }

          // Handle payment pending error
          if (
            errorCode === "PAYMENT_PENDING" ||
            safeErrorMessage.includes("subscription is pending payment") ||
            safeErrorMessage.includes("pending payment")
          ) {
            const displayMessage =
              safeErrorMessage ||
              "Your subscription is pending payment. Please complete your payment to access your account.";
            toast.error(displayMessage);
            setError(displayMessage);
            return;
          }

          // Handle user pending error (with payment data - redirect to checkout)
          if (
            errorCode === "USER_PENDING" ||
            (safeErrorMessage.includes("account is pending payment") &&
              !safeErrorMessage.includes("select a plan"))
          ) {
            toast.info("Please complete your payment to activate your account");
            // Redirect to checkout if they have payment data
            navigate("/checkout", {
              state: {
                pendingPayment: true,
              },
              replace: true,
            });
            return;
          }

          // Handle user pending error (no payment data - redirect to pricing)
          if (
            errorCode === "USER_PENDING_NO_PLAN" ||
            errorCode === "USER_PENDING_NO_PLAN" ||
            (safeErrorMessage.includes("account is pending") &&
              safeErrorMessage.includes("select a plan"))
          ) {
            const displayMessage =
              safeErrorMessage ||
              "Please select a plan and complete payment to activate your account";
            toast.info(displayMessage);
            setError(displayMessage);
            navigate("/pricing", {
              state: {
                fromSignin: true,
                pendingAccount: true,
              },
              replace: true,
            });
            return;
          }

          // Handle specific sub admin deactivation error
          if (
            safeErrorMessage.includes("deactivated") ||
            errorCode === "SUBADMIN_DEACTIVATED"
          ) {
            toast.error(
              "Your account has been deactivated. Please contact the administrator for assistance."
            );
            setError(
              "Your account has been deactivated. Please contact the administrator for assistance."
            );
            return;
          }

          // Check if it's a 500 error that might contain our custom error
          // Better Auth sometimes wraps errors in 500 responses
          if (
            (ctx.error as any)?.status === 500 ||
            (ctx.error as any)?.response?.status === 500 ||
            (ctx.error as any)?.statusCode === 500
          ) {
            // Check if the error message contains our pending user message
            const lowerMessage = safeErrorMessage.toLowerCase();
            if (
              lowerMessage.includes("account is pending") ||
              lowerMessage.includes("select a plan") ||
              lowerMessage.includes("complete payment to activate")
            ) {
              // Check if it's the "no plan" variant
              if (
                lowerMessage.includes("select a plan") ||
                errorCode === "USER_PENDING_NO_PLAN"
              ) {
                const displayMessage =
                  safeErrorMessage ||
                  "Please select a plan and complete payment to activate your account";
                toast.info(displayMessage);
                setError(displayMessage);
                navigate("/pricing", {
                  state: {
                    fromSignin: true,
                    pendingAccount: true,
                  },
                  replace: true,
                });
                return;
              } else {
                // User has payment data, redirect to checkout
                toast.info(
                  "Please complete your payment to activate your account"
                );
                navigate("/checkout", {
                  state: {
                    pendingPayment: true,
                  },
                  replace: true,
                });
                return;
              }
            }
          }

          // Before showing generic error, check if it might be a pending user error we missed
          // This catches cases where Better Auth wraps the error in a 500 or different format
          const lowerMessage = safeErrorMessage.toLowerCase();
          if (
            lowerMessage.includes("account is pending") ||
            lowerMessage.includes("select a plan") ||
            lowerMessage.includes("complete payment to activate") ||
            errorCode === "USER_PENDING_NO_PLAN" ||
            errorCode === "USER_PENDING"
          ) {
            // It's a pending user error
            if (
              lowerMessage.includes("select a plan") ||
              errorCode === "USER_PENDING_NO_PLAN"
            ) {
              const displayMessage =
                safeErrorMessage ||
                "Please select a plan and complete payment to activate your account";
              toast.info(displayMessage);
              setError(displayMessage);
              navigate("/pricing", {
                state: {
                  fromSignin: true,
                  pendingAccount: true,
                },
                replace: true,
              });
              return;
            } else {
              // User has payment data
              toast.info(
                "Please complete your payment to activate your account"
              );
              navigate("/checkout", {
                state: {
                  pendingPayment: true,
                },
                replace: true,
              });
              return;
            }
          }

          // Handle other errors - but first check if it might be a deactivation error we missed
          if (
            lowerMessage.includes("deactivated") ||
            lowerMessage.includes("suspended") ||
            lowerMessage.includes("inactive") ||
            errorCode === 403
          ) {
            // Might be a deactivation error in a different format
            const displayMessage =
              safeErrorMessage ||
              "Your account has been deactivated. Please contact the administrator for assistance.";
            toast.error(displayMessage);
            setError(displayMessage);
            return;
          }

          // FINAL FINAL CHECK: Before showing any generic error, check one last time for trial expiration
          // This is the absolute last resort - check everything one more time
          const ultimateErrorCheck = [
            JSON.stringify(ctx.error || {}),
            (ctx.error as any)?.stack || "",
            (ctx.error as any)?.message || "",
            (ctx.error as any)?.cause?.message || "",
            (ctx.error as any)?.cause?.data?.message || "",
            (ctx.error as any)?.cause?.code || "",
            (ctx.error as any)?.cause?.data?.code || "",
            safeErrorMessage,
            errorCode,
          ]
            .join(" ")
            .toLowerCase();

          console.log("🔍 Ultimate error check:", {
            hasTrialExpired: ultimateErrorCheck.includes(
              "trial period has expired"
            ),
            hasDemoAccount: ultimateErrorCheck.includes("demo account"),
            errorCode,
            safeErrorMessage,
          });

          if (
            ultimateErrorCheck.includes("trial period has expired") ||
            errorCode === "TRIAL_EXPIRED"
          ) {
            console.log("✅ Trial expiration detected in ultimate check!");
            const isDemo = ultimateErrorCheck.includes("demo account");
            const displayMessage = isDemo
              ? "This demo account's trial period has expired. Please contact the administrator for assistance."
              : "Your trial period has expired. Please contact the administrator to upgrade your subscription.";
            toast.error(displayMessage);
            setError(displayMessage);
            return;
          }

          // Handle other errors - ensure we always show a string, not an object
          let finalErrorMessage = safeErrorMessage;

          if (!finalErrorMessage || finalErrorMessage === "") {
            // Try to extract from ctx.error
            if (typeof ctx.error?.message === "string") {
              finalErrorMessage = ctx.error.message;
            } else if (typeof ctx.error === "string") {
              finalErrorMessage = ctx.error;
            } else if (ctx.error && typeof ctx.error === "object") {
              // If it's an object, try to extract a meaningful message
              try {
                const errorStr = JSON.stringify(ctx.error);
                // Check if error string contains trial expiration
                if (
                  errorStr.toLowerCase().includes("trial period has expired")
                ) {
                  const isDemo = errorStr
                    .toLowerCase()
                    .includes("demo account");
                  finalErrorMessage = isDemo
                    ? "This demo account's trial period has expired. Please contact the administrator for assistance."
                    : "Your trial period has expired. Please contact the administrator to upgrade your subscription.";
                } else if (errorStr === "{}" || errorStr.length > 200) {
                  finalErrorMessage =
                    "Login failed. Please check your credentials and try again or check with admin for assistance.";
                } else {
                  finalErrorMessage = errorStr;
                }
              } catch {
                finalErrorMessage =
                  "Login failed. Please check your credentials and try again or check with admin for assistance.";
              }
            } else {
              finalErrorMessage =
                "Login failed. Please check your credentials and try again or check with admin for assistance.";
            }
          }

          // Final safety check - ensure it's never an object
          if (typeof finalErrorMessage !== "string") {
            finalErrorMessage =
              "Login failed. Please check your credentials and try again or check with admin for assistance.";
          }

          toast.error(finalErrorMessage);
          setError(finalErrorMessage);
        },
      }
    );
  };

  return (
    <>
      <FormWrapper
        description="Log In to access your account"
        logoSource="/logo/logowithtext.png"
        label="Log In. Take Control"
      >
        <Form {...form}>
          <form
            className="flex flex-col gap-5"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="mt-8">
                  <FormLabel className="font-normal">Email</FormLabel>
                  <FormControl>
                    <Input
                      size="lg"
                      placeholder="Enter email here"
                      {...field}
                      className="bg-white rounded-full border border-gray-100 placeholder:text-gray-400 focus:border-gray-400 placeholder:text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-normal">Password</FormLabel>
                  <FormControl>
                    <Box className="relative">
                      <Input
                        size="lg"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter Password"
                        className="bg-white rounded-full border border-gray-100 placeholder:text-gray-400 focus:border-gray-400 placeholder:text-sm"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                      >
                        {showPassword ? (
                          <IoEyeOff size={20} />
                        ) : (
                          <IoEye size={20} />
                        )}
                      </button>
                    </Box>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Flex className="justify-between mb-8 gap-0">
              <Anchor to="/auth/signup" className="text-sm text-black">
                Don't have an account?
              </Anchor>
              <Anchor
                to="/auth/verify-email"
                className="text-sm text-[#F48E2D]"
              >
                Forgot Password?
              </Anchor>
            </Flex>

            {error && (
              <Box className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </Box>
            )}

            <Button
              size="xl"
              disabled={isLoading}
              aria-busy={isLoading}
              className="bg-[#1797B9] text-white rounded-full cursor-pointer hover:bg-[#1797B9]/80 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="inline-flex items-center">
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </Form>
      </FormWrapper>
    </>
  );
};
