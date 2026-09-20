import { completeEmailSignIn } from "@/features/auth/complete-email-sign-in";
import { handleSignInError } from "@/features/auth/handle-sign-in-error";
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
import type { FC } from "react";
import { z } from "zod";
import { Box } from "../ui/box";
import { toast } from "sonner";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { RefreshCw } from "lucide-react";
import { useUser } from "@/providers/user.provider";

const formSchema = z.object({
  password: z
    .string()
    .min(8, "Invalid Password")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character",
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
        "Your account has been deactivated. Please contact the administrator for assistance.",
      );
      setError(
        "Your account has been deactivated. Please contact the administrator for assistance.",
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
    const ports = { navigate, refetchUser, setIsLoading, setError };
    authClient.signIn.email({ email, password }, {
      onRequest: () => setIsLoading(true),
      onSuccess: ({ data }) => completeEmailSignIn(email, data, ports),
      onError: (ctx) => handleSignInError(ctx, ports),
    });
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
                      className="bg-background rounded-full border border-border placeholder:text-muted-foreground focus:border-gray-400 placeholder:text-sm"
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
                        className="bg-background rounded-full border border-border placeholder:text-muted-foreground focus:border-gray-400 placeholder:text-sm"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute end-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
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
              <Anchor to="/auth/signup" className="text-sm text-foreground">
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
                  <RefreshCw className="me-2 h-4 w-4 animate-spin" />
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
