import { IoArrowBack, IoEye, IoEyeOff } from "react-icons/io5";
import { PageWrapper } from "@/components/common/pagewrapper";
import { Box } from "@/components/ui/box";
import { useNavigate } from "react-router";
import { Center } from "@/components/ui/center";
import { Stack } from "@/components/ui/stack";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormItem,
  FormLabel,
  FormField,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateSubAdmin } from "@/hooks/usecreatesubadmin";
import { toast } from "sonner";
import { ErrorWithMessage } from "@/configs/axios.config";
import { useState } from "react";

const formSchema = z
  .object({
    firstName: z.string().min(2, {
      message: "First Name must be at least 2 characters.",
    }),
    lastName: z.string().min(2, {
      message: "Last Name must be at least 2 characters.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    contactNumber: z.string().optional(),
    permission: z.enum(["Active", "Deactivated"], {
      message: "Please select a valid permission status.",
    }),
    password: z
      .string()
      .min(8, {
        message: "Password must be at least 8 characters.",
      })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter.",
      })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter.",
      })
      .regex(/[0-9]/, {
        message: "Password must contain at least one number.",
      })
      .regex(/[^A-Za-z0-9]/, {
        message: "Password must contain at least one special character.",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const CreateSubAdmin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const { isPending: isCreatePending, mutate: createSubAdminMutate } =
    useCreateSubAdmin();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "Sub",
      lastName: "Admin",
      email: "subadmin@gmail.com",
      contactNumber: "1234567890",
      permission: "Active",
      password: "Sub@11111",
      confirmPassword: "Sub@11111",
    },
  });

  async function onSubmit(value: z.infer<typeof formSchema>) {
    console.log(value);
    createSubAdminMutate(
      {
        firstName: value.firstName,
        lastName: value.lastName,
        email: value.email,
        contactNumber: value.contactNumber || undefined,
        permission: value.permission,
        password: value.password,
      },
      {
        onError: (error: ErrorWithMessage) => {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to create sub admin";
          toast.error(errorMessage);
        },
        onSuccess: async (response) => {
          toast.success(response.message || "Sub Admin created successfully");
          navigate("/superadmin/sub-admin");
        },
      }
    );
  }

  return (
    <PageWrapper className="mt-6 p-6 relative">
      <Box
        className="flex items-center gap-2 w-20 cursor-pointer transition-all duration-300  hover:bg-gray-200 rounded-full hover:p-2 "
        onClick={() => navigate(-1)}
      >
        <IoArrowBack />
        <p className="text-black">Back</p>
      </Box>

      <Center className="justify-between mt-6 max-sm:flex-col max-sm:items-start gap-2">
        <Stack className="gap-0">
          <h1 className="text-black text-xl font-medium">Create Sub Admin</h1>
          <h1 className="text-gray-500">
            Create Sub Admin and allow permissions to keep your team aligned and
            productive.
          </h1>
        </Stack>
      </Center>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8">
          <Button
            variant="outline"
            className="bg-black text-white border border-gray-200  rounded-full px-6 py-5 flex items-center gap-2 cursor-pointer absolute top-20 right-4"
            isLoading={isCreatePending}
            type="submit"
          >
            Add & Save
          </Button>
          <Box className="bg-white/80 rounded-xl border border-gray-200 p-6 gap-4 grid grid-cols-1">
            <Box className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name:</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white rounded-full placeholder:text-gray-400"
                        size="lg"
                        type="text"
                        placeholder="Enter First Name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name:</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white rounded-full placeholder:text-gray-400"
                        placeholder="Enter Last Name"
                        type="text"
                        size="lg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Box>

            <Box className="grid grid-cols-2 gap-6 max-md:grid-cols-1 mt-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email:</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white rounded-full placeholder:text-gray-400"
                        placeholder="Enter Email"
                        type="email"
                        size="lg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number (Optional):</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white rounded-full placeholder:text-gray-400"
                        size="lg"
                        type="tel"
                        placeholder="Enter Contact Number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Box>

            <Box className="grid grid-cols-2 gap-6 max-md:grid-cols-1 mt-2">
              <FormField
                control={form.control}
                name="permission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permission Status:</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl className="w-full h-11">
                        <SelectTrigger
                          size="lg"
                          className="bg-gray-100 border border-gray-300 rounded-full w-full h-12"
                        >
                          <SelectValue placeholder="Select Permission Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="w-full">
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Deactivated">Deactivated</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    <Box className="text-xs text-gray-500 mt-1">
                      <Box>
                        • <strong>Active:</strong> Sub admin can log in and
                        access the system
                      </Box>
                      <Box>
                        • <strong>Deactivated:</strong> Sub admin cannot log in
                        or access the system
                      </Box>
                    </Box>
                  </FormItem>
                )}
              />
            </Box>

            <h1 className="text-gray-500 font-medium mt-4">Set Password</h1>
            <Box className="grid grid-cols-2 gap-6 max-md:grid-cols-1 mt-2">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <Box className="relative">
                    <FormItem>
                      <FormLabel>Password:</FormLabel>
                      <FormControl>
                        <Input
                          className="bg-white rounded-full placeholder:text-gray-400"
                          size="lg"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter Password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-11 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                    >
                      {showPassword ? (
                        <IoEyeOff size={20} />
                      ) : (
                        <IoEye size={20} />
                      )}
                    </button>
                    {/* Password requirements helper text */}
                    <Box className="text-xs text-gray-500 mt-2 space-y-1">
                      <Box>Password must contain:</Box>
                      <Box>• At least 8 characters</Box>
                      <Box>• At least one uppercase letter (A-Z)</Box>
                      <Box>• At least one lowercase letter (a-z)</Box>
                      <Box>• At least one number (0-9)</Box>
                      <Box>• At least one special character (!@#$%^&*)</Box>
                    </Box>
                  </Box>
                )}
              />

              <Box className="relative">
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password:</FormLabel>
                      <FormControl>
                        <Input
                          className="bg-white rounded-full placeholder:text-gray-400"
                          size="lg"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter Confirm Password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-11 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                >
                  {showPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
                </button>
              </Box>
            </Box>
          </Box>
        </form>
      </Form>
    </PageWrapper>
  );
};
