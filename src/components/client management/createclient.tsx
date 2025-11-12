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
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { useCallback, useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Center } from "../ui/center";
import { Input } from "../ui/input";
import "../usermanagement/phonenumberstyle.css";
import { Box } from "../ui/box";
import { z } from "zod";
import { PageWrapper } from "../common/pagewrapper";
import { useNavigate, useLocation } from "react-router";
import { IoArrowBack } from "react-icons/io5";
import { Stack } from "../ui/stack";
import { useCreateClient } from "@/hooks/usecreateclient";
import { useUpdateClient } from "@/hooks/useupdateclient";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";
import {
  FaInstagram,
  FaTwitter,
  FaFacebook,
  FaLinkedin,
  FaYoutube,
  FaTiktok,
  FaSnapchat,
  FaPinterest,
} from "react-icons/fa";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const socialMediaTypes = [
  {
    value: "instagram",
    label: "Instagram",
    icon: FaInstagram,
    color: "#E4405F",
  },
  { value: "twitter", label: "Twitter/X", icon: FaTwitter, color: "#1DA1F2" },
  { value: "facebook", label: "Facebook", icon: FaFacebook, color: "#1877F2" },
  { value: "linkedin", label: "LinkedIn", icon: FaLinkedin, color: "#0077B5" },
  { value: "youtube", label: "YouTube", icon: FaYoutube, color: "#FF0000" },
  { value: "tiktok", label: "TikTok", icon: FaTiktok, color: "#000000" },
  { value: "snapchat", label: "Snapchat", icon: FaSnapchat, color: "#FFFC00" },
  {
    value: "pinterest",
    label: "Pinterest",
    icon: FaPinterest,
    color: "#BD081C",
  },
] as const;

type SocialMediaType = (typeof socialMediaTypes)[number]["value"];

interface SocialMediaLink {
  type: SocialMediaType;
  url: string;
}

const formSchema = z.object({
  fullname: z.string().min(2, {
    message: "Full Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Must be a valid email address.",
  }),
  phonenumber: z.string().min(1, {
    message: "Phone number is required.",
  }),
  cpfcnpj: z.string().min(2, {
    message: "Must be a valid CPF/CNPJ",
  }),
  address: z.string().min(2, {
    message: "Must be a valid address",
  }),
  industry: z.string().min(2, {
    message: "Must be a valid industry",
  }),
  socialMediaLinks: z
    .array(
      z.object({
        type: z.string(),
        url: z
          .string()
          .url({ message: "Must be a valid URL" })
          .or(z.literal("")),
      })
    )
    .optional(),
});

interface ClientFormProps {
  mode: "create" | "edit";
  client?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    cpfcnpj?: string;
    businessIndustry?: string;
    address?: string;
    status: string;
    image?: string;
    socialMediaLinks?: string; // JSON string
  };
  onSuccess?: () => void;
  onClose?: () => void;
}

export const ClientForm = ({
  mode,
  client,
  onSuccess,
  onClose,
}: ClientFormProps) => {
  const navigate = useNavigate();
  const { mutate: createClient, isPending: isCreating } = useCreateClient();
  const { mutate: updateClient, isPending: isUpdating } = useUpdateClient();

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [pdfPreview, setPdfPreview] = useState<string | null>(
    client?.image || null
  );
  const [imageError, setImageError] = useState<string>("");
  const [isCompressing, setIsCompressing] = useState(false);
  const [isImageRemoved, setIsImageRemoved] = useState(false);
  const [socialMediaLinks, setSocialMediaLinks] = useState<SocialMediaLink[]>(
    () => {
      if (client?.socialMediaLinks) {
        try {
          return typeof client.socialMediaLinks === "string"
            ? JSON.parse(client.socialMediaLinks)
            : client.socialMediaLinks;
        } catch (error) {
          console.error("Error parsing social media links:", error);
          return [];
        }
      }
      return [];
    }
  );

  const isPending = isCreating || isUpdating;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullname: client?.name || "Client Name",
      email: client?.email || "client@example.com",
      phonenumber: client?.phone || "+1234567890",
      cpfcnpj: client?.cpfcnpj || "1234567890",
      address: client?.address || "123 Main St, Anytown, USA",
      industry: client?.businessIndustry || "Technology",
      socialMediaLinks: client?.socialMediaLinks
        ? JSON.parse(client.socialMediaLinks)
        : [],
    },
  });

  // Update form when client data changes (for edit mode)
  useEffect(() => {
    if (client && mode === "edit") {
      const parsedSocialLinks = client.socialMediaLinks
        ? JSON.parse(client.socialMediaLinks)
        : [];
      form.reset({
        fullname: client.name,
        email: client.email,
        phonenumber: client.phone || "+1234567890",
        cpfcnpj: client.cpfcnpj || "1234567890",
        address: client.address || "123 Main St, Anytown, USA",
        industry: client.businessIndustry || "Technology",
        socialMediaLinks: parsedSocialLinks,
      });
      setSocialMediaLinks(parsedSocialLinks);
      setPdfPreview(client.image || null);
    }
  }, [client, mode, form]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Only allow images and check size
      if (!file.type.startsWith("image/")) {
        setImageError("Only image files are allowed.");
        setUploadedFile(null);
        setPdfPreview(null);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setImageError("Image size must be less than 10MB.");
        setUploadedFile(null);
        setPdfPreview(null);
        return;
      }
      setUploadedFile(file);
      setImageError("");
      setIsImageRemoved(false);
      const fileUrl = URL.createObjectURL(file);
      setPdfPreview(fileUrl);
    }
  }, []);

  const removeImage = () => {
    setUploadedFile(null);
    setPdfPreview(null);
    setIsImageRemoved(true);
  };

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

  // Function to compress image before upload
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 800x800)
        const maxSize = 800;
        let { width, height } = img;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7); // 70% quality

        resolve(compressedBase64);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    // For create mode, require image upload
    if (mode === "create" && !uploadedFile) {
      setImageError("Please upload a profile image.");
      return;
    }
    setImageError("");

    // Convert form data to match backend schema
    const clientData = {
      name: values.fullname,
      email: values.email,
      phone: values.phonenumber,
      cpfcnpj: values.cpfcnpj,
      businessIndustry: values.industry,
      address: values.address,
      status: mode === "create" ? "New Lead" : client?.status || "New Lead",
      socialMediaLinks: JSON.stringify(
        socialMediaLinks.filter((link) => link.url.trim() !== "")
      ),
    };

    if (mode === "edit") {
      // Update mode - handle image updates

      // Ensure we have a valid client ID
      if (!client?.id) {
        toast.error("Client ID not found. Cannot update client.");
        return;
      }

      if (uploadedFile) {
        // New image uploaded
        setIsCompressing(true);
        toast.info("Compressing image...");

        compressImage(uploadedFile)
          .then((compressedBase64) => {
            setIsCompressing(false);

            updateClient(
              {
                clientId: client.id,
                data: { ...clientData, image: compressedBase64 },
              },
              {
                onSuccess: () => {
                  toast.success("Client updated successfully!");
                  onSuccess?.();
                  onClose?.();
                },
                onError: (Error) => {
                  console.error("Error updating client:", Error);
                  toast.error("Failed to update client. Please try again.");
                },
              }
            );
          })
          .catch(() => {
            setIsCompressing(false);
            toast.error("Failed to compress image. Please try again.");
          });
      } else if (isImageRemoved) {
        // Image was removed
        updateClient(
          {
            clientId: client.id,
            data: { ...clientData, image: "" },
          },
          {
            onSuccess: () => {
              toast.success("Client updated successfully!");
              onSuccess?.();
              onClose?.();
            },
            onError: (Error) => {
              console.error("Error updating client:", Error);
              toast.error("Failed to update client. Please try again.");
            },
          }
        );
      } else {
        // No image changes
        updateClient(
          {
            clientId: client.id,
            data: clientData,
          },
          {
            onSuccess: () => {
              toast.success("Client updated successfully!");
              onSuccess?.();
              onClose?.();
            },
            onError: () => {
              toast.error("Failed to update client. Please try again.");
            },
          }
        );
      }
    } else {
      // Create mode
      setIsCompressing(true);
      toast.info("Compressing image...");

      compressImage(uploadedFile!)
        .then((compressedBase64) => {
          setIsCompressing(false);
          createClient(
            { ...clientData, image: compressedBase64 },
            {
              onSuccess: () => {
                toast.success("Client created successfully!");
                onSuccess?.();
                onClose?.();
              },
              onError: () => {
                toast.error("Failed to create client. Please try again.");
              },
            }
          );
        })
        .catch(() => {
          setIsCompressing(false);
          toast.error("Failed to compress image. Please try again.");
        });
    }
  }

  return (
    <PageWrapper className="mt-6 p-6 relative">
      <Box
        className="flex items-center gap-2 w-20 cursor-pointer transition-all duration-300  hover:bg-gray-200 rounded-full hover:p-2 "
        onClick={() => {
          if (mode === "edit") {
            // In edit mode, go back to client management
            onClose?.();
          } else {
            // In create mode, go back to previous page
            navigate(-1);
          }
        }}
      >
        <IoArrowBack />
        <p className="text-black">Back</p>
      </Box>

      <Center className="justify-between mt-4">
        <Box className="text-2xl font-bold text-black">
          {mode === "edit" ? "Update Client" : "Create Client"}
        </Box>
      </Center>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8">
          <Button
            type="submit"
            disabled={isPending || isCompressing}
            // className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            className="bg-black text-white border border-gray-200 rounded-full px-6 py-5 flex items-center gap-2 cursor-pointer mb-6 absolute top-15 right-5"
          >
            {isCompressing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Compressing...
              </>
            ) : isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === "edit" ? "Updating..." : "Creating..."}
              </>
            ) : mode === "edit" ? (
              "Update Client"
            ) : (
              "Create Client"
            )}
          </Button>
          <Box className="bg-white/80 rounded-xl border border-gray-200 p-6 gap-6 grid grid-cols-1">
            <Stack className="gap-0">
              <h1 className="text-black text-xl font-medium">Client Details</h1>
            </Stack>

            {!pdfPreview ? (
              <Box className="grid grid-cols-1">
                <p className="text-md mb-2 font-normal">
                  Upload Profile Picture
                </p>
                <Center
                  className="flex-col border-dashed border-2 border-[#62A1C0] bg-gray-100/50 rounded-lg min-h-40 w-44 max-md:w-full cursor-pointer"
                  onClick={open}
                >
                  <img
                    src="/dashboard/camera.svg"
                    alt="task-image"
                    className="size-14"
                  />
                  <Stack className="text-center gap-0 mt-4">
                    <p className="text-gray-800 text-sm font-medium">
                      Image must be
                    </p>
                    <p className="text-gray-800 text-sm font-medium">
                      500px by 500px
                    </p>
                  </Stack>
                </Center>
                <input {...getInputProps()} />
                {imageError && (
                  <p className="text-red-500 text-sm mt-2">{imageError}</p>
                )}
              </Box>
            ) : (
              <Box className="border-2 border-[#62A1C0] rounded-lg p-4 relative w-50 h-50">
                <Stack className="gap-2">
                  <Box className="flex w-full absolute top-0 right-0 p-2">
                    <Button variant="outline" size="sm" onClick={removeImage}>
                      X
                    </Button>
                  </Box>
                  {pdfPreview && (
                    <Box className="w-40 h-40 border-dashed border-gray-200 rounded">
                      <img
                        src={pdfPreview}
                        title="Profile Preview"
                        className="object-contain w-full h-full"
                        style={{ border: "none" }}
                        onError={() => {
                          setImageError("Image preview failed to load.");
                        }}
                      />
                    </Box>
                  )}
                  {imageError && (
                    <p className="text-red-500 text-sm mt-2">{imageError}</p>
                  )}
                </Stack>
              </Box>
            )}

            <Box className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
              <FormField
                control={form.control}
                name="fullname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name:</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white rounded-full placeholder:text-gray-400"
                        size="xl"
                        type="text"
                        placeholder="Enter Full Name"
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
                    {/* <FormLabel>Phone Number:</FormLabel> */}
                    <FormControl>
                      <PhoneInput
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
                name="cpfcnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF/CNPJ:</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white rounded-full placeholder:text-gray-400"
                        size="xl"
                        type="text"
                        placeholder="Enter CPF/CNPJ"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address:</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white rounded-full placeholder:text-gray-400"
                        size="xl"
                        type="text"
                        placeholder="Enter Address"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Industry:</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white rounded-full placeholder:text-gray-400"
                        size="xl"
                        type="text"
                        placeholder="Enter Industry"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Box>

            {/* Social Media Links Section */}
            <Box className="mt-6">
              <Stack className="gap-4">
                <h1 className="text-black text-xl font-medium">
                  Social Media Links
                </h1>
                <Box className="space-y-4">
                  {socialMediaLinks.map((link, index) => {
                    const socialType = socialMediaTypes.find(
                      (type) => type.value === link.type
                    );
                    const Icon = socialType?.icon || FaInstagram;
                    const availableTypes = socialMediaTypes.filter(
                      (type) =>
                        !socialMediaLinks.some(
                          (l, i) => l.type === type.value && i !== index
                        )
                    );

                    return (
                      <Box
                        key={index}
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg bg-white"
                      >
                        <Select
                          value={link.type}
                          onValueChange={(value) => {
                            const updated = [...socialMediaLinks];
                            updated[index].type = value as SocialMediaType;
                            setSocialMediaLinks(updated);
                          }}
                        >
                          <SelectTrigger className="w-40 bg-white">
                            <SelectValue>
                              <Box className="flex items-center gap-2">
                                {socialType && (
                                  <>
                                    <Icon
                                      className="w-5 h-5"
                                      style={{ color: socialType.color }}
                                    />
                                    <span>{socialType.label}</span>
                                  </>
                                )}
                              </Box>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {availableTypes.map((type) => {
                              const TypeIcon = type.icon;
                              return (
                                <SelectItem key={type.value} value={type.value}>
                                  <Box className="flex items-center gap-2">
                                    <TypeIcon
                                      className="w-4 h-4"
                                      style={{ color: type.color }}
                                    />
                                    <span>{type.label}</span>
                                  </Box>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>

                        <Input
                          className="flex-1 bg-white rounded-full placeholder:text-gray-400"
                          size="xl"
                          type="url"
                          placeholder="Enter social media URL"
                          value={link.url}
                          onChange={(e) => {
                            const updated = [...socialMediaLinks];
                            updated[index].url = e.target.value;
                            setSocialMediaLinks(updated);
                          }}
                        />

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSocialMediaLinks(
                              socialMediaLinks.filter((_, i) => i !== index)
                            );
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </Box>
                    );
                  })}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const availableTypes = socialMediaTypes.filter(
                        (type) =>
                          !socialMediaLinks.some(
                            (link) => link.type === type.value
                          )
                      );
                      if (availableTypes.length > 0) {
                        setSocialMediaLinks([
                          ...socialMediaLinks,
                          { type: availableTypes[0].value, url: "" },
                        ]);
                      }
                    }}
                    disabled={
                      socialMediaLinks.length >= socialMediaTypes.length
                    }
                    className="w-full border-dashed border-2 border-gray-300 hover:border-gray-400"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Social Media Link
                  </Button>
                </Box>
              </Stack>
            </Box>
          </Box>
        </form>
      </Form>
    </PageWrapper>
  );
};

// Wrapper component for backward compatibility
export const CreateClient = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Check if we're in edit mode from navigation state
  const editMode = location.state?.mode === "edit";
  const clientData = location.state?.client;

  return (
    <ClientForm
      mode={editMode ? "edit" : "create"}
      client={editMode ? clientData : undefined}
      onSuccess={() => {
        if (editMode) {
          toast.success("Client updated successfully!");
          // Navigate back to client management
          navigate("/dashboard/client-management");
        } else {
          // Navigate back after successful creation
          navigate(-1);
        }
      }}
      onClose={() => {
        if (editMode) {
          // Navigate back to client management
          navigate("/dashboard/client-management");
        } else {
          // Navigate back
          navigate("/dashboard/client-management");
        }
      }}
    />
  );
};
