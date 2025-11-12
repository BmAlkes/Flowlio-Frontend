import { FC, useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Box } from "@/components/ui/box";
import { Stack } from "@/components/ui/stack";
import { Center } from "@/components/ui/center";
import { Mail, ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";

const otpSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
});

interface OTPSignInProps {
  email: string;
  onBack: () => void;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  isLoading?: boolean;
}

export const OTPSignIn: FC<OTPSignInProps> = ({
  email,
  onBack,
  onVerify,
  onResend,
  isLoading = false,
}) => {
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const form = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleSubmit = async (values: z.infer<typeof otpSchema>) => {
    try {
      await onVerify(values.otp);
    } catch (error) {
      console.error("OTP verification failed:", error);
    }
  };

  const handleResend = async () => {
    try {
      await onResend();
      setCountdown(60);
      setCanResend(false);
      toast.success("OTP sent successfully!");
    } catch (error) {
      console.error("Failed to resend OTP:", error);
      toast.error("Failed to resend OTP. Please try again.");
    }
  };

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Only allow digits
    if (value.length <= 6) {
      form.setValue("otp", value);
    }
  };
  const navigate = useNavigate();
  return (
    <Center className="min-h-screen bg-gray-50 px-4">
      <Box className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        {/* Header */}
        <Stack className="gap-4 text-center mb-8">
          <Center className="mx-auto w-16 h-16 bg-blue-100 rounded-full">
            <Mail className="w-8 h-8 text-blue-600" />
          </Center>
          <Stack className="gap-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Check Your Email
            </h1>
            <p className="text-gray-600">
              We've sent a 6-digit verification code to
            </p>
            <p className="font-semibold text-gray-900">{email}</p>
          </Stack>
        </Stack>

        {/* OTP Form */}
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Stack className="gap-2">
            <label className="text-sm font-medium text-gray-700">
              Enter Verification Code
            </label>
            <Input
              {...form.register("otp")}
              onChange={handleOTPChange}
              value={form.watch("otp")}
              className="text-center text-2xl font-mono tracking-widest h-14"
              placeholder="000000"
              maxLength={6}
              disabled={isLoading}
            />
            {form.formState.errors.otp && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.otp.message}
              </p>
            )}
          </Stack>

          {/* Resend OTP */}
          <Center>
            <Button
              type="button"
              variant="ghost"
              onClick={handleResend}
              disabled={!canResend || isLoading}
              className="text-blue-600 hover:text-blue-800"
            >
              {canResend ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Resend Code
                </>
              ) : (
                `Resend in ${countdown}s`
              )}
            </Button>
          </Center>

          {/* Action Buttons */}
          <Stack className="gap-3">
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12"
              disabled={isLoading || form.watch("otp").length !== 6}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onBack || (() => navigate("/auth/signin"))}
              disabled={isLoading}
              className="w-full h-12 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Button>
          </Stack>
        </form>

        {/* Help Text */}
        <Box className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Didn't receive the code? Check your spam folder or{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={!canResend}
              className="text-blue-600 hover:text-blue-800 underline disabled:opacity-50"
            >
              try again
            </button>
          </p>
        </Box>
      </Box>
    </Center>
  );
};
