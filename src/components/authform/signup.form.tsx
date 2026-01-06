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
import { authClient, useUser } from "@/providers/user.provider";
import type { FC } from "react";
import { z } from "zod";
import { Box } from "../ui/box";
import { toast } from "sonner";
import { Anchor } from "../ui/anchor";
import { Flex } from "../ui/flex";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { usePlanSelectionStore } from "@/store/planSelection.store";

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
  const { refetchUser } = useUser();
  const { selectedPlanIndex, selectedPlanId } = usePlanSelectionStore();

  // Check if plan is selected, if not redirect to pricing
  useEffect(() => {
    if (selectedPlanIndex === null || !selectedPlanId) {
      // No plan selected, redirect to pricing first
      toast.info("Please select a plan first");
      navigate("/pricing", {
        state: {
          fromSignup: true,
        },
        replace: true,
      });
    }
  }, [selectedPlanIndex, selectedPlanId, navigate]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rememberMe: true,
      createpassword: "",
      email: ``,
      username: ``,
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
            console.log("🔄 Signup request initiated for:", data.email);
          },
          onSuccess: async (response) => {
            console.log("✅ Signup successful, response:", response);
            toast.success("Account created successfully!");

            // SIMPLIFIED FLOW: Just wait for session, then redirect based on store
            // Wait for Better Auth session to be established
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Refetch user data to ensure session is loaded (silently, don't block on errors)
            try {
              await refetchUser();
            } catch (error) {
              console.error("Error refetching user:", error);
              // Continue anyway - session might still be established
            }

            // SIMPLIFIED: Check store for plan ID - that's our source of truth
            if (selectedPlanId) {
              console.log("✅ Plan ID in store, redirecting to checkout");
              navigate("/checkout", {
                state: {
                  fromSignup: true,
                  pendingPayment: false,
                },
                replace: true,
              });
              setIsLoading(false);
              return;
            }

            // If no plan in store, redirect to pricing
            console.log("⚠️ No plan ID in store, redirecting to pricing");
            navigate("/pricing", {
              state: {
                fromSignup: true,
                pendingAccount: true,
              },
              replace: true,
            });
            setIsLoading(false);
            return;
          },
          onError: (ctx: any) => {
            let errorMessage = "Signup failed. Please try again.";

            if (ctx?.error?.message) {
              errorMessage = ctx.error.message;
            } else if (ctx?.error?.status === 500) {
              errorMessage = "Server error. Please try again later.";
            } else if (ctx?.error?.status === 400) {
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
