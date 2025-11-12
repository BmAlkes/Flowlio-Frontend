import { z } from "zod";
import { Box } from "@/components/ui/box";
import { Stack } from "@/components/ui/stack";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useState } from "react";
import { useUpdateSuperAdminPassword } from "@/hooks/useupdatesuperadminpassword";
import { toast } from "sonner";

export const formSchema = z
  .object({
    currentpassword: z.string().min(8, {
      message: "Current password must be at least 8 characters long.",
    }),

    newpassword: z
      .string()
      .min(8, { message: "New password must be at least 8 characters long." })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
          message:
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).",
        }
      ),

    confirmpassword: z.string().min(8, {
      message: "Please confirm your password (minimum 8 characters).",
    }),
  })
  .refine((data) => data.newpassword === data.confirmpassword, {
    message: "New password and confirm password must match.",
    path: ["confirmpassword"],
  })
  .refine((data) => data.currentpassword !== data.newpassword, {
    message: "New password must be different from current password.",
    path: ["newpassword"],
  });

export const SettingsPasswordSecurity = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentpassword: "",
      newpassword: "",
      confirmpassword: "",
    },
  });

  const updatePasswordMutation = useUpdateSuperAdminPassword();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function onSubmit(values: z.infer<typeof formSchema>) {
    updatePasswordMutation.mutate(
      {
        currentPassword: values.currentpassword,
        newPassword: values.newpassword,
      },
      {
        onSuccess: () => {
          toast.success("Password updated successfully");
          form.reset();
        },
        onError: (error: any) => {
          toast.error(
            error.response?.data?.message || "Failed to update password"
          );
        },
      }
    );
  }

  return (
    <Stack className="w-full bg-white border border-gray-400/50  p-8 rounded-md max-md:px-3">
      <Stack>
        <h1 className="text-2xl font-semibold">Password & Security</h1>
        <h1>Manage your passwords, login preferences and recovery methods.</h1>
      </Stack>

      <Box className=" bg-gray-100/80 border border-gray-400/50 mt-4 min-h-6 w-2xl p-4 rounded-md max-md:w-full max-md:text-xs">
        Your password must be at least 8 characters and include:
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>At least one uppercase letter (A-Z)</li>
          <li>At least one lowercase letter (a-z)</li>
          <li>At least one number (0-9)</li>
          <li>At least one special character (@$!%*?&)</li>
        </ul>
      </Box>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8">
          <Stack className="gap-6">
            <FormField
              control={form.control}
              name="currentpassword"
              render={({ field }) => (
                <FormItem className="w-md max-sm:w-full">
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Box className="relative">
                      <Input
                        className="bg-whitepr-10"
                        size="lg"
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Enter Current Password"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer z-10"
                      >
                        {showCurrentPassword ? (
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

            <FormField
              control={form.control}
              name="newpassword"
              render={({ field }) => (
                <FormItem className="w-md max-sm:w-full">
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Box className="relative">
                      <Input
                        className="bg-white pr-10"
                        placeholder="Enter New Password"
                        type={showNewPassword ? "text" : "password"}
                        size="lg"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer z-10"
                      >
                        {showNewPassword ? (
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
            <FormField
              control={form.control}
              name="confirmpassword"
              render={({ field }) => (
                <FormItem className="w-md max-sm:w-full">
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Box className="relative">
                      <Input
                        className="bg-white pr-10"
                        placeholder="Enter Confirm New Password"
                        type={showConfirmPassword ? "text" : "password"}
                        size="lg"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer z-10"
                      >
                        {showConfirmPassword ? (
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
          </Stack>
          <Button
            className="flex ml-auto mt-6 w-34 h-10 rounded-full bg-[#1797b9] hover:bg-[#1797b9]/80 hover:text-white text-white border border-gray-200 cursor-pointer"
            type="submit"
            disabled={updatePasswordMutation.isPending}
          >
            {updatePasswordMutation.isPending ? "Updating..." : "Save Changes"}
          </Button>
        </form>
      </Form>
    </Stack>
  );
};
