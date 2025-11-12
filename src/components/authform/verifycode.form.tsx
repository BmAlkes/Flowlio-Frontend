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
import { useNavigate, useLocation } from "react-router";
import { useForm } from "react-hook-form";
import { Anchor } from "../ui/anchor";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Flex } from "../ui/flex";
import { useEffect, useState, type FC } from "react";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { authClient } from "@/providers/user.provider";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

const formSchema = z.object({
  code: z
    .string()
    .min(6, "Code must be 6 digits")
    .max(6, "Code must be 6 digits")
    .regex(/^\d+$/, "Code must contain only numbers"),
});

export const VerifyCodeForm: FC = () => {
  useEffect(() => {
    scrollTo(0, 0);
    document.title = "Verify Code - Flowlio";
  }, []);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!email) {
      toast.error("Email not found. Please start over.");
      navigate("/auth/verify-email");
      return;
    }

    setIsLoading(true);
    try {
      // Use Better Auth's checkVerificationOtp method to verify the OTP
      // According to Better Auth docs: https://www.better-auth.com/docs/plugins/email-otp
      const { error } = await authClient.emailOtp.verifyEmail({
        email: email,
        otp: values.code,
      });

      if (error) {
        toast.error(error.message || "Invalid code. Please try again.");
        setIsLoading(false);
        return;
      }

      // Code verified successfully - navigate to reset password page
      toast.success("Code verified successfully!");
      navigate("/auth/reset-password", {
        state: {
          email: email,
          otp: values.code, // Pass OTP for password reset
        },
      });
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Invalid code. Please try again."
      );
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      navigate("/auth/verify-email");
      return;
    }

    setIsLoading(true);
    try {
      // Use Better Auth's emailOTP to resend password reset code
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: email,
        type: "forget-password",
      });

      if (error) {
        toast.error(
          error.message || "Failed to resend code. Please try again."
        );
        setIsLoading(false);
        return;
      }

      toast.success("Reset code sent again! Please check your inbox.");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to resend code. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex className="flex flex-col text-start justify-start items-start max-md:py-8  w-[30rem] max-sm:w-full">
      <Anchor
        to="/auth/signin"
        className="flex text-center justify-center items-center gap-1 w-fit text-sm text-[#1797B9] hover:text-[#1797B9]/80 mb-16 max-sm:m-0 underline px-2"
      >
        <ArrowLeft className="size-4" />
        Back to login
      </Anchor>
      <FormWrapper
        description="We've sent a 6-digit verification code to your email. Please enter the code below to continue."
        logoSource="/logo/logowithtext.png"
        label="Enter Verification Code"
      >
        <Form {...form}>
          <form
            className="flex flex-col gap-5"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem className="mt-8">
                  <FormLabel className="font-normal">
                    Verification Code
                  </FormLabel>
                  <FormControl>
                    <Input
                      size="lg"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      className="bg-white rounded-full border border-gray-100 placeholder:text-gray-400 focus:border-gray-400 placeholder:text-sm text-center text-2xl tracking-widest"
                      {...field}
                      onChange={(e) => {
                        // Only allow numbers
                        const value = e.target.value.replace(/\D/g, "");
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  {email && (
                    <p className="text-xs text-gray-500 mt-2">
                      Code sent to {email}
                    </p>
                  )}
                </FormItem>
              )}
            />

            <Button
              size="xl"
              type="submit"
              disabled={isLoading}
              className="bg-[#1797B9] text-white rounded-full cursor-pointer hover:bg-[#1797B9]/80 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="inline-flex items-center">
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </span>
              ) : (
                "Verify Code"
              )}
            </Button>

            <Flex className="justify-center flex-wrap max-sm:justify-center max-sm:flex-col mt-2">
              <h2 className="text-sm text-gray-600">
                Didn't receive the code?
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isLoading}
                  className="underline text-[#F48E2D] hover:text-[#F48E2D]/80 hover:underline cursor-pointer ml-1 disabled:opacity-50"
                >
                  Resend
                </button>
              </h2>
            </Flex>
          </form>
        </Form>
      </FormWrapper>
    </Flex>
  );
};
