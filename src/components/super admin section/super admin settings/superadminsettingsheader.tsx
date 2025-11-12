import { ComponentWrapper } from "@/components/common/componentwrapper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Flex } from "@/components/ui/flex";
import { Stack } from "@/components/ui/stack";
import { Input } from "@/components/ui/input";
import { Box } from "@/components/ui/box";
import {
  GeneralModal,
  useGeneralModalDisclosure,
} from "@/components/common/generalmodal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useUpdateUserProfile } from "@/hooks/useupdateuserprofile";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEffect } from "react";
// import { SettingsDelectAccount } from "./settingsdelectaccount";
import { SettingsNotification } from "./settingsnotification";
import { SettingsPasswordSecurity } from "./settingspasswordsecurity";
import { SettingsTwoFactor } from "./settingstwofactor";
import { UpdateProfileImageContent } from "./updateprofileimagecontent";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

export const SuperAdminSettingsHeader = ({ user }: { user: any }) => {
  const modalProps = useGeneralModalDisclosure();
  const queryClient = useQueryClient();
  const updateProfileMutation = useUpdateUserProfile();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  // Update form values when user data changes
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user, form]);

  const handleChangeLogo = () => {
    modalProps.onOpenChange(true);
  };

  const handleCloseImageModal = () => {
    modalProps.onOpenChange(false);
  };

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    try {
      // Update profile information (name, email)
      const profileData = {
        name: values.name,
        email: values.email,
      };

      await updateProfileMutation.mutateAsync(profileData);

      // Force refetch user data to ensure form is updated
      await queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      await queryClient.invalidateQueries({ queryKey: ["user"] });

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
    }
  };

  // Add null check for user
  if (!user) {
    return (
      <ComponentWrapper className="mt-8 px-10 py-4 max-md:px-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <div className="mt-4 text-gray-500">Loading user data...</div>
      </ComponentWrapper>
    );
  }

  return (
    <ComponentWrapper className="mt-8 px-10 py-4 max-md:px-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <Stack className="gap-8">
        {/* Profile Information Section */}
        <Stack className="gap-0 min-h-4 w-md max-md:w-full border border-gray-200 rounded-md overflow-hidden mt-4">
          <Flex className="justify-between bg-white p-4 border-b border-gray-200">
            <h1 className="text-lg font-semibold">Profile Information</h1>
            <Center className="text-green-600 gap-2 font-semibold text-sm">
              <span className="bg-green-600 rounded-full min-h-2 w-2 animate-pulse"></span>
              {user.role === "superadmin"
                ? "Super Admin"
                : user.role === "subadmin"
                ? "Sub Admin"
                : user.role === "user"
                ? "User"
                : "Unknown"}
            </Center>
          </Flex>

          <Box className="bg-[#F8F8F8] p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Avatar Section */}
                <Flex className="justify-between items-start mb-6">
                  <Box>
                    <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                      Profile Picture
                    </FormLabel>
                    <Flex className="gap-4 items-center justify-between w-full">
                      <Avatar className="relative hover:z-1 border-2 border-white size-20">
                        <AvatarImage
                          src={user.image || "https://github.com/shadcn.png"}
                          alt={user.name || "User"}
                        />
                        <AvatarFallback>
                          {(user.name || "User")?.charAt(0)?.toUpperCase() ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleChangeLogo}
                        className="bg-white hover:bg-gray-50 ml-auto cursor-pointer"
                      >
                        Change Logo
                      </Button>
                    </Flex>
                  </Box>
                </Flex>

                {/* Name Field */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-white rounded-full placeholder:text-gray-400"
                          placeholder="Enter your full name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          className="bg-white rounded-full placeholder:text-gray-400"
                          placeholder="Enter your email address"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Flex className="justify-end gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="bg-[#1797b9] hover:bg-[#1797b9]/80 rounded-full px-6 cursor-pointer"
                  >
                    {updateProfileMutation.isPending
                      ? "Saving..."
                      : "Save Changes"}
                  </Button>
                </Flex>
              </form>
            </Form>
          </Box>
        </Stack>

        <SettingsNotification />
        <SettingsTwoFactor />
        <SettingsPasswordSecurity />
        {/* <SettingsDelectAccount /> */}
      </Stack>

      {/* Profile Image Update Modal */}
      <GeneralModal {...modalProps}>
        <UpdateProfileImageContent
          onClose={handleCloseImageModal}
          currentImage={user.image}
          userName={user.name || "User"}
        />
      </GeneralModal>
    </ComponentWrapper>
  );
};
