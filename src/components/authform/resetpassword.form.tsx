import {
  Form,
  FormItem,
  FormLabel,
  FormField,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { CircleX, CircleCheck, ArrowLeft } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormWrapper } from "./formwrapper";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { Anchor } from "../ui/anchor";
import { Button } from "../ui/button";
import { Stack } from "../ui/stack";
import { Input } from "../ui/input";
import { Flex } from "../ui/flex";
import { useEffect, useState, type FC } from "react";
import { z } from "zod";
import { useSearchParams } from "react-router";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { authClient } from "@/providers/user.provider";

const formSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),

    confirmPassword: z
      .string()
      .min(8, { message: "Password should be 8 characters long." }),
  })
  .refine((c) => c.password === c.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

export const ResetPasswordForm: FC = () => {
  useEffect(() => {
    scrollTo(0, 0);
    document.title = "Reset Password - Flowlio";
  }, []);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // Get token from URL query parameter (from email reset link)
  // Better Auth redirects with ?token=XXX or ?error=INVALID_TOKEN
  const token = searchParams.get("token") || "";
  const error = searchParams.get("error");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      confirmPassword: "",
      password: "",
    },
  });

  // Check if token exists or if there's an error
  useEffect(() => {
    if (error === "INVALID_TOKEN" || (!token && error)) {
      toast.error(
        "Invalid or expired reset token. Please request a new password reset."
      );
      navigate("/auth/verify-email");
    } else if (!token) {
      toast.error(
        "Invalid or missing reset token. Please request a new password reset."
      );
      navigate("/auth/verify-email");
    }
  }, [token, error, navigate]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!token) {
      toast.error("Invalid reset token. Please request a new password reset.");
      navigate("/auth/verify-email");
      return;
    }

    setIsLoading(true);
    try {
      // Use Better Auth's resetPassword with token from email link
      const { error } = await authClient.resetPassword({
        newPassword: values.password,
        token: token,
      });

      if (error) {
        toast.error(
          error.message || "Failed to reset password. Please try again."
        );
        setIsLoading(false);
        return;
      }

      // Success
      toast.success(
        "Password reset successfully! You can now login with your new password."
      );
      navigate("/auth/signin");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to reset password. Please try again."
      );
      setIsLoading(false);
    }
  };

  const password = form.watch().password;
  const passwordConditions = [
    { label: "Minimum 8 characters", valid: password.length >= 8 },
    { label: "At least one upper case letter", valid: /[A-Z]/.test(password) },
    {
      label: "Use at least one special character (*#@!&+)",
      valid: /[^A-Za-z0-9]/.test(password),
    },
  ];

  return (
    <Flex className="flex flex-col text-start justify-start items-start max-md:py-8 w-[30rem] max-sm:w-full gap-4">
      <Anchor
        to="/auth/signin"
        className="flex text-center justify-center items-center gap-1 w-fit text-sm text-[#1797B9] hover:text-[#1797B9]/80 underline px-2"
      >
        <ArrowLeft className="size-4" />
        Back to login
      </Anchor>

      <FormWrapper
        description="Enter your new password below to complete the reset process, ensure it's strong and secure."
        logoSource="/logo/logowithtext.png"
        label="Create New Password"
        className="p-4"
      >
        <Form {...form}>
          <form
            className="flex flex-col gap-5"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="mt-8">
                  <FormLabel className="font-normal">Password</FormLabel>
                  <FormControl>
                    <Input
                      size="lg"
                      type="password"
                      placeholder="Password"
                      className="bg-white rounded-full border border-gray-100 placeholder:text-gray-400 focus:border-gray-400 placeholder:text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-normal">
                    Re-type New Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      size="lg"
                      type="password"
                      placeholder="Re-type Password"
                      className="bg-white rounded-full border border-gray-100 placeholder:text-gray-400 focus:border-gray-400 placeholder:text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Stack>
              <h2>Password Must:</h2>
              {passwordConditions.map(({ valid, label }, key) => (
                <Flex key={key}>
                  {valid ? (
                    <CircleCheck
                      size={18}
                      className="text-white fill-green-600"
                    />
                  ) : (
                    <CircleX size={18} className="text-white fill-black" />
                  )}
                  <span className="text-sm text-slate-700">{label}</span>
                </Flex>
              ))}
            </Stack>

            <Button
              size="xl"
              type="submit"
              disabled={isLoading || !token}
              className="bg-[#1797B9] text-white rounded-full cursor-pointer hover:bg-[#1797B9]/80 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="inline-flex items-center">
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Resetting Password...
                </span>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </Form>
      </FormWrapper>
    </Flex>
  );
};
