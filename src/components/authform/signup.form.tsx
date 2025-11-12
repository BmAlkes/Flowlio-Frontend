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
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import { authClient } from "@/providers/user.provider";
import type { FC } from "react";
import { z } from "zod";
import { Box } from "../ui/box";
import { toast } from "sonner";
import { Anchor } from "../ui/anchor";
import { Flex } from "../ui/flex";
import { IoEye, IoEyeOff } from "react-icons/io5";

const formSchema = z.object({
  username: z.string().min(1, { message: "Required field" }),
  createpassword: z
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

export const SignUpForm: FC = () => {
  useEffect(() => {
    scrollTo(0, 0);
    document.title = "Sign Up - Flowlio";
  }, []);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rememberMe: true,
      createpassword: "Test@123",
      email: `test${Date.now()}@gmail.com`,
      username: `test${Date.now()}`,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);

    try {
      // Create the user account
      await authClient.signUp.email(
        {
          name: data.username,
          email: data.email,
          password: data.createpassword,
        },
        {
          onRequest: () => {
            setIsLoading(true);
          },
          onSuccess: async () => {
            toast.success(
              "Account created successfully! Please select a plan."
            );

            // Check if user came from checkout with a plan selection
            const location = window.location;
            const urlParams = new URLSearchParams(location.search);
            const selectedPlan = urlParams.get("plan");
            const fromCheckout = urlParams.get("fromCheckout");

            // Check if we have plan details in the navigation state
            const navigationState = window.history.state?.usr;
            const hasPlanDetails = navigationState?.selectedPlan !== undefined;
            const redirectTo = navigationState?.redirectTo;

            if (redirectTo === "checkout" && hasPlanDetails) {
              // User came from checkout, redirect back to checkout
              navigate("/checkout", {
                state: {
                  selectedPlan: navigationState.selectedPlan,
                  createOrganization: true,
                },
              });
            } else if (fromCheckout && selectedPlan) {
              // User came from checkout via URL params, redirect back to checkout
              navigate("/checkout", {
                state: {
                  selectedPlan: parseInt(selectedPlan),
                  createOrganization: true,
                },
              });
            } else if (navigationState?.selectedPlan !== undefined) {
              // Fallback: check navigation state directly
              navigate("/checkout", {
                state: {
                  selectedPlan: navigationState.selectedPlan,
                  createOrganization: true,
                },
              });
            } else {
              // Regular signup flow, redirect to pricing
              navigate("/pricing", {
                state: {
                  fromSignup: true,
                },
              });
            }

            setIsLoading(false);
          },
          onError: (ctx) => {
            let errorMessage = "Signup failed. Please try again.";

            if (ctx.error.message) {
              errorMessage = ctx.error.message;
            } else if (ctx.error.status === 500) {
              errorMessage = "Server error. Please try again later.";
            } else if (ctx.error.status === 400) {
              errorMessage =
                "Invalid signup data. Please check your information.";
            }

            toast.error(errorMessage);
            setError(errorMessage);
            setIsLoading(false);
          },
        }
      );
    } catch (error) {
      console.error("💥 Unexpected signup error:", error);
      setIsLoading(false);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <FormWrapper
      description="A Seamless Way to Manage Your Dashboard"
      logoSource="/logo/logowithtext.png"
      label="Create an account"
    >
      <Form {...form}>
        <form
          className="flex flex-col gap-3"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel className="font-normal">Username</FormLabel>
                <FormControl>
                  <Input
                    size="lg"
                    placeholder="Enter username here"
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
            name="email"
            render={({ field }) => (
              <FormItem>
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
            name="createpassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-normal">Create Password</FormLabel>
                <FormControl>
                  <Box className="relative">
                    <Input
                      size="lg"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a New Password"
                      className="bg-white rounded-full border border-gray-100 placeholder:text-gray-400 focus:border-gray-400 placeholder:text-sm pr-12"
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

          <Flex className="justify-end gap-0">
            <Anchor to="/auth/signin" className="text-sm text-blue-500">
              Already have an account?
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
            className="bg-[#1797B9] text-white rounded-full cursor-pointer hover:bg-[#1797B9]/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </Form>
    </FormWrapper>
  );
};
