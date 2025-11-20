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

    if (deactivationError) {
      toast.error(deactivationError);
      setError(deactivationError);
      sessionStorage.removeItem("deactivationError");
    } else if (trialExpiredError) {
      toast.error(trialExpiredError);
      setError(trialExpiredError);
      sessionStorage.removeItem("trialExpiredError");
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
    }
  }, [searchParams]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rememberMe: true,
      password: "Test@123",
      email: "tahirkhanji007@gmail.com",
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

            // Check if organization is deactivated or trial expired
            if (profileResponse.status === 403) {
              const errorCode = profileResponse.data?.code;
              if (
                errorCode === "ORGANIZATION_DEACTIVATED" ||
                errorCode === "TRIAL_EXPIRED"
              ) {
                const errorMessage =
                  profileResponse.data?.message ||
                  "Access denied. Please contact the administrator for assistance.";
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

            const userProfile = profileResponse.data.data;

            // Check if user has 2FA enabled
            if (userProfile.twoFactorEnabled) {
              // Store email for OTP verification
              sessionStorage.setItem("otpEmail", email);
              setIsLoading(false);

              // Redirect to OTP verification page
              navigate("/auth/signin-otp", { replace: true });
              return;
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
            // Check if organization is deactivated or trial expired
            if ((error as any).response?.status === 403) {
              const errorCode = (error as any).response?.data?.code;
              const errorMessage =
                (error as any).response?.data?.message ||
                "Access denied. Please contact the administrator for assistance.";

              if (
                errorCode === "ORGANIZATION_DEACTIVATED" ||
                errorCode === "TRIAL_EXPIRED"
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
        onError: (ctx) => {
          setIsLoading(false);

          // Log full error structure for debugging
          console.log("Sign-in error:", ctx.error);
          console.log("Error structure:", {
            message: ctx.error?.message,
            code: (ctx.error as any)?.code,
            data: (ctx.error as any)?.data,
            response: (ctx.error as any)?.response,
            statusCode: (ctx.error as any)?.statusCode,
            fullError: ctx.error,
          });

          // Extract error message from various possible locations
          const errorMessage =
            ctx.error?.message ||
            (ctx.error as any)?.data?.message ||
            (ctx.error as any)?.response?.data?.message ||
            (ctx.error as any)?.response?.message ||
            "";

          // Extract error code from various possible locations
          const errorCode =
            (ctx.error as any)?.code ||
            (ctx.error as any)?.data?.code ||
            (ctx.error as any)?.response?.data?.code ||
            (ctx.error as any)?.statusCode;

          // Check for organization deactivation error
          const isDeactivated =
            errorCode === "ORGANIZATION_DEACTIVATED" ||
            errorCode === 403 ||
            errorMessage.toLowerCase().includes("deactivated") ||
            errorMessage
              .toLowerCase()
              .includes("demo account has been deactivated") ||
            errorMessage
              .toLowerCase()
              .includes("organization account has been deactivated");

          if (isDeactivated) {
            // Show the specific error message from backend
            const displayMessage =
              errorMessage ||
              "Your organization account has been deactivated. Please contact the administrator for assistance.";
            toast.error(displayMessage);
            setError(displayMessage);
            return;
          }

          // Handle trial expired error
          if (
            errorCode === "TRIAL_EXPIRED" ||
            errorMessage.includes("trial period has expired")
          ) {
            toast.error(
              errorMessage ||
                "Your trial period has expired. Please contact the administrator to upgrade your subscription."
            );
            setError(
              errorMessage ||
                "Your trial period has expired. Please contact the administrator to upgrade your subscription."
            );
            return;
          }

          // Handle specific sub admin deactivation error
          if (
            errorMessage.includes("deactivated") ||
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

          // Handle other errors - but first check if it might be a deactivation error we missed
          const lowerMessage = errorMessage.toLowerCase();
          if (
            lowerMessage.includes("deactivated") ||
            lowerMessage.includes("suspended") ||
            lowerMessage.includes("inactive") ||
            errorCode === 403
          ) {
            // Might be a deactivation error in a different format
            const displayMessage =
              errorMessage ||
              "Your account has been deactivated. Please contact the administrator for assistance.";
            toast.error(displayMessage);
            setError(displayMessage);
            return;
          }

          // Handle other errors
          const displayMessage =
            errorMessage ||
            ctx.error?.message ||
            "Login failed. Please check your credentials and try again or check with admin for assistance.";
          toast.error(displayMessage);
          setError(displayMessage);
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
