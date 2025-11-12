import {
  Form,
  FormItem,
  FormLabel,
  FormField,
  FormMessage,
  FormControl,
} from "../ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import PhoneInput from "react-phone-input-2";
import { useForm } from "react-hook-form";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "../ui/button";
import { Center } from "../ui/center";
import { Input } from "../ui/input";
import "./phonenumberstyle.css";
import { Box } from "../ui/box";
import { z } from "zod";
import { PageWrapper } from "../common/pagewrapper";
import { useNavigate } from "react-router";
import { IoArrowBack } from "react-icons/io5";
import { Stack } from "../ui/stack";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useCreateUserMember } from "@/hooks/usecreateusermember";
import { toast } from "sonner";
import { useGetAllUserMembers } from "@/hooks/usegetallusermembers";

const formSchema = z
  .object({
    firstname: z.string().min(2, {
      message: "First Name must be at least 2 characters.",
    }),
    lastname: z.string().min(2, {
      message: "Last Name must be at least 2 characters.",
    }),
    email: z.string().min(2, {
      message: "Must be Email Address.",
    }),
    phonenumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, {
      message: "Must be a valid international phone number",
    }),
    companyname: z.string().min(2, {
      message: "Must be Company Name",
    }),
    userrole: z.string().min(2, {
      message: "Must be proper role",
    }),
    setpermission: z.string().min(2, {
      message: "Must be proper permission",
    }),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmpassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmpassword, {
    message: "Passwords do not match",
    path: ["confirmpassword"],
  });

export const CreateUserMembers = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstname: "Test",
      lastname: "User",
      email: "testuser@gmail.com",
      phonenumber: "+923052095951",
      companyname: "Test Company",
      userrole: "",
      setpermission: "",
      password: "Test@123",
      confirmpassword: "Test@123",
    },
  });

  const createUserMember = useCreateUserMember();
  const { refetch } = useGetAllUserMembers();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // File upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("firstname", values.firstname);
      formData.append("lastname", values.lastname);
      formData.append("email", values.email);
      formData.append("phonenumber", values.phonenumber);
      formData.append("companyname", values.companyname);
      formData.append("userrole", values.userrole);
      formData.append("setpermission", values.setpermission);
      formData.append("password", values.password);

      // Add profile image if uploaded
      if (uploadedFile) {
        formData.append("profileImage", uploadedFile);
      }
      await createUserMember.mutateAsync(formData);

      toast.success("User member created successfully!");
      form.reset();
      refetch();
      setUploadedFile(null);
      setImagePreview(null);
      setImageError(null);
      navigate(-1);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to create user member";
      toast.error(errorMessage);
      console.error("Error creating user member:", error);
    }
  }

  // File upload functionality
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setImageError("File size must be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setImageError("Please select a valid image file");
        return;
      }

      setUploadedFile(file);
      setImageError(null);

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getInputProps, open } = useDropzone({
    maxFiles: 1,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpeg"],
      "image/jpg": [".jpg"],
      "image/gif": [".gif"],
      "image/webp": [".webp"],
      "image/svg": [".svg"],
      "image/bmp": [".bmp"],
    },
    onDrop,
  });

  return (
    <PageWrapper className="mt-6 p-6 relative">
      <Box
        className="flex items-center gap-2 w-20 cursor-pointer transition-all duration-300  hover:bg-gray-200 rounded-full hover:p-2 "
        onClick={() => navigate(-1)}
      >
        <IoArrowBack />
        <p className="text-black">Back</p>
      </Box>

      <Center className="justify-between mt-4">
        <Stack className="gap-0">
          <h1 className="text-black text-xl font-medium">Add Members</h1>
          <h1 className="text-gray-500">
            Fill in the details to create a new project
          </h1>
        </Stack>
      </Center>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8">
          <Button
            variant="outline"
            className="bg-black text-white border border-gray-200 rounded-full px-6 py-5 flex items-center gap-2 cursor-pointer mb-6 absolute top-15 right-5"
            type="submit"
            disabled={createUserMember.isPending}
          >
            {createUserMember.isPending ? "Creating..." : "Save Member"}
          </Button>
          <Box className="bg-white/80 rounded-xl border border-gray-200 p-6 gap-6 grid grid-cols-1">
            <Stack className="gap-0">
              <h1 className="text-gray-500">Step 1</h1>
              <h1 className="text-black text-xl font-medium">
                Personal Information
              </h1>
            </Stack>

            {/* Profile picture upload section */}
            <Box className="grid grid-cols-1">
              <p className="text-md mb-2 font-normal">
                Profile Picture (Optional)
              </p>
              <Center className="flex-col border-dashed border-2 border-gray-300 bg-gray-100/50 rounded-lg min-h-44 w-48 max-md:w-full">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="profile-preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <>
                    <img
                      src="/dashboard/camera.svg"
                      alt="profile-image"
                      className="size-14 opacity-50"
                    />
                    <Stack className="text-center gap-0 mt-4">
                      <p className="text-gray-500 text-sm">
                        Profile picture upload
                      </p>
                      <p className="text-gray-500 text-sm">Click to upload</p>
                    </Stack>
                  </>
                )}

                {/* Hidden file input */}
                <input {...getInputProps()} />

                {/* Upload button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={open}
                  className="mt-2"
                  disabled={createUserMember.isPending}
                >
                  {imagePreview ? "Change Image" : "Upload Image"}
                </Button>

                {/* Remove image button */}
                {imagePreview && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setUploadedFile(null);
                      setImagePreview(null);
                    }}
                    className="mt-2 text-red-600 border-red-600 hover:bg-red-50"
                    disabled={createUserMember.isPending}
                  >
                    Remove
                  </Button>
                )}
              </Center>

              {/* Error message */}
              {imageError && (
                <p className="text-red-500 text-sm mt-2">{imageError}</p>
              )}

              {/* Help text */}
              <p className="text-gray-500 text-xs mt-2">
                Supported formats: PNG, JPG, JPEG, GIF, WebP, SVG, BMP • Max
                size: 5MB
              </p>
            </Box>

            <Box className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
              <FormField
                control={form.control}
                name="firstname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name:</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white rounded-full placeholder:text-gray-400"
                        size="xl"
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
                name="lastname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name:</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white rounded-md placeholder:text-gray-400"
                        size="xl"
                        type="text"
                        placeholder="Enter Last Name"
                        {...field}
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
                    <FormLabel>Email Address:</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white rounded-full placeholder:text-gray-400"
                        size="xl"
                        type="email"
                        placeholder="Enter Email Address"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phonenumber"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <PhoneInput
                        specialLabel="Phone Number"
                        country={"us"}
                        placeholder="Phone Number:"
                        enableSearch={true}
                        inputClass="mt-2 w-full h-14 bg-white border border-gray-300 rounded-full px-4 text-black focus:ring-0 focus:outline-none"
                        buttonClass="border-r h-12 border-gray-300 bg-transparent"
                        dropdownClass="bg-white border border-gray-300"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companyname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name:</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white rounded-full placeholder:text-gray-400"
                        size="xl"
                        type="text"
                        placeholder="Enter Company Name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Box>
          </Box>

          <Box className="bg-white/80 rounded-xl border border-gray-200 p-6 gap-6 grid grid-cols-1 mt-4">
            <Stack className="gap-0">
              <h1 className="text-gray-500">Step 2</h1>
              <h1 className="text-black text-xl font-medium">
                Role & Permissions
              </h1>
            </Stack>

            <Box className="grid grid-cols-2 gap-6 max-md:grid-cols-1 mt-4">
              <FormField
                control={form.control}
                name="userrole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Role:</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl className="w-full h-12">
                        <SelectTrigger
                          size="lg"
                          className="bg-gray-100 border border-gray-200 rounded-full w-full h-12 placeholder:text-gray-100"
                        >
                          <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="w-full">
                        <SelectItem value="viewer">Viewer</SelectItem>
                        {/* <SelectItem value="operator">Operator</SelectItem> */}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="setpermission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Set Permission:</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl className="w-full h-12">
                        <SelectTrigger
                          size="lg"
                          className="bg-gray-100 border border-gray-200 rounded-full w-full h-12 placeholder:text-gray-100"
                        >
                          <SelectValue placeholder="Select Permission" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="w-full">
                        <SelectItem value="view">View</SelectItem>
                        <SelectItem value="edit">Edit</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Box>
          </Box>

          <Box className="bg-white/80 rounded-xl border border-gray-200 p-6 gap-6 grid grid-cols-1 mt-4">
            <Stack className="gap-0">
              <h1 className="text-gray-500">Step 3</h1>
              <h1 className="text-black text-xl font-medium">Set Credential</h1>
            </Stack>

            <Box className="grid grid-cols-2 gap-6 max-md:grid-cols-1 mt-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password:</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white rounded-full placeholder:text-gray-400"
                        size="xl"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter Password"
                        {...field}
                      />
                    </FormControl>

                    <Box className="flex">
                      <FormMessage />
                      <Box
                        className="ml-auto text-right text-[#1E6EE5] cursor-pointer text-sm"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? "Hide Password" : "Show Password"}
                      </Box>
                    </Box>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmpassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password:</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white rounded-full placeholder:text-gray-400"
                        size="xl"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Enter Confirm Password"
                        {...field}
                      />
                    </FormControl>

                    <Box className="flex">
                      <FormMessage />
                      <Box
                        className="ml-auto text-right text-[#1E6EE5] cursor-pointer text-sm"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword
                          ? "Hide Password"
                          : "Show Password"}
                      </Box>
                    </Box>
                  </FormItem>
                )}
              />
            </Box>
          </Box>
        </form>
      </Form>
    </PageWrapper>
  );
};
