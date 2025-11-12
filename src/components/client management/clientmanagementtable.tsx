import { ColumnDef } from "@tanstack/react-table";
import { Center } from "@/components/ui/center";
import { Box } from "../ui/box";
import { Flex } from "../ui/flex";
import { ReusableTable } from "../reusable/reusabletable";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  FaRegTrashAlt,
  FaInstagram,
  FaTwitter,
  FaFacebook,
  FaLinkedin,
  FaYoutube,
  FaTiktok,
  FaSnapchat,
  FaPinterest,
} from "react-icons/fa";
import { Ellipsis, Eye, Pencil, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  GeneralModal,
  useGeneralModalDisclosure,
} from "../common/generalmodal";
import { useState } from "react";
import { Stack } from "../ui/stack";
import { useFetchOrganizationClients } from "@/hooks/usefetchclients";
import { useDeleteClient } from "@/hooks/usedeleteclient";
import { useUpdateClient } from "@/hooks/useupdateclient";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

// Mock data for fallback (will be replaced by API data)
const mockData: Data[] = [
  {
    id: "1",
    status: "No Data",
    name: "No Data",
    email: "No Data",
    phone: "No Data",
    cpfcnpj: "No Data",
    socialMediaLinks: "No Data",
    address: "USA",
    businessIndustry: "Technology",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export type Project = {
  id: string;
  name: string;
  status:
    | "New Lead"
    | "In Negotiation"
    | "Contract Signed"
    | "Project In Progress"
    | "Completed"
    | "Inactive Client";
  completionRate: number; // 0-100
  contractFile: string; // file name or URL
};

export type Data = {
  id: string;
  status: string;
  email: string;
  phone?: string;
  name: string;
  cpfcnpj?: string;
  address?: string;
  businessIndustry?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  projects?: Project[];
  socialMediaLinks?: string; // JSON string
};

export const ClientManagementTable = () => {
  const props = useGeneralModalDisclosure();
  const [selectedClient, setSelectedClient] = useState<Data | null>(null);
  const navigate = useNavigate();

  // Fetch clients from API
  const {
    data: clientsData,
    isLoading,
    error,
    refetch,
  } = useFetchOrganizationClients();

  const { mutate: deleteClient, isPending: isDeleting } = useDeleteClient();
  const { mutate: updateClient, isPending: isUpdatingStatus } =
    useUpdateClient();

  const handleStatusChange = (clientId: string, newStatus: string) => {
    updateClient(
      {
        clientId,
        data: { status: newStatus },
      },
      {
        onSuccess: () => {
          toast.success("Client status updated successfully");
          refetch();
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.error || "Failed to update client status"
          );
        },
      }
    );
  };

  const openViewClientModal = (client: Data) => {
    setSelectedClient(client);
    props.onOpenChange(true);
  };

  const openEditClientModal = (client: Data) => {
    // Redirect to create client page with edit mode
    navigate("/dashboard/client-management/create-client", {
      state: {
        mode: "edit",
        client: client,
      },
    });
  };

  // Handle delete client
  const handleDeleteClient = async (id: string, email: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${email}? This action cannot be undone.`
      )
    ) {
      try {
        deleteClient(id);
        toast.success("Client deleted successfully");
        refetch();
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message || "Failed to delete client";
        toast.error(errorMessage);
      }
    }
  };

  // Define columns inside the component to access the functions
  const columns: ColumnDef<Data>[] = [
    {
      accessorKey: "name",
      header: () => <Box className="text-black pl-4">Name</Box>,
      cell: ({ row }) => (
        <Flex className="capitalize pl-4 w-30 max-sm:w-full">
          <Avatar className="size-8">
            <AvatarImage
              src={row.original.image || "https://github.com/shadcn.png"}
            />
            <AvatarFallback>
              {row.original.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {row.original.name.length > 14
            ? row.original.name.slice(0, 14) + "..."
            : row.original.name}
        </Flex>
      ),
    },

    {
      accessorKey: "cpfcnpj",
      header: () => <Box className="text-black text-center">CPF/CNPJ</Box>,
      cell: ({ row }) => (
        <Box className="captialize text-center">{row.original.cpfcnpj}</Box>
      ),
    },

    {
      accessorKey: "address",
      header: () => <Box className="text-black text-center">Address</Box>,
      cell: ({ row }) => (
        <Box className="captialize text-center">{row.original.address}</Box>
      ),
    },

    {
      id: "social",
      header: () => <Box className="text-center text-black">Social</Box>,
      cell: ({ row }) => {
        const socialLinks = row.original.socialMediaLinks
          ? typeof row.original.socialMediaLinks === "string"
            ? JSON.parse(row.original.socialMediaLinks)
            : row.original.socialMediaLinks
          : [];

        const socialIcons: Record<string, any> = {
          instagram: FaInstagram,
          twitter: FaTwitter,
          facebook: FaFacebook,
          linkedin: FaLinkedin,
          youtube: FaYoutube,
          tiktok: FaTiktok,
          snapchat: FaSnapchat,
          pinterest: FaPinterest,
        };

        const socialColors: Record<string, string> = {
          instagram: "#E4405F",
          twitter: "#1DA1F2",
          facebook: "#1877F2",
          linkedin: "#0077B5",
          youtube: "#FF0000",
          tiktok: "#000000",
          snapchat: "#FFFC00",
          pinterest: "#BD081C",
        };

        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="w-8 h-8 p-0 flex items-center justify-center cursor-pointer"
              >
                <Ellipsis className="text-gray-600" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <Box className="text-sm font-semibold mb-3">Contact & Social</Box>
              <Box className="mb-2">
                <span className="font-medium text-xs">Email:</span>{" "}
                <span className="text-xs">{row.original.email}</span>
              </Box>
              <Box className="mb-3">
                <span className="font-medium text-xs">Phone:</span>{" "}
                <span className="text-xs">{row.original.phone || "N/A"}</span>
              </Box>
              {Array.isArray(socialLinks) && socialLinks.length > 0 && (
                <>
                  <Box className="text-sm font-semibold mb-2 mt-3 pt-3 border-t">
                    Social Media
                  </Box>
                  <Box className="flex flex-wrap gap-2">
                    {socialLinks.map((link: any, index: number) => {
                      const Icon = socialIcons[link.type] || FaInstagram;
                      const color = socialColors[link.type] || "#000000";
                      return (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 p-1.5 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                          title={link.type}
                        >
                          <Icon className="w-4 h-4" style={{ color }} />
                        </a>
                      );
                    })}
                  </Box>
                </>
              )}
            </PopoverContent>
          </Popover>
        );
      },
    },

    {
      accessorKey: "businessIndustry",
      header: () => <Box className="text-black text-center">Industry</Box>,
      cell: ({ row }) => (
        <Box className="captialize text-center">
          {row.original.businessIndustry || "N/A"}
        </Box>
      ),
    },

    {
      accessorKey: "status",
      header: () => <Box className="text-center text-black">Status</Box>,
      cell: ({ row }) => {
        const status = row.original.status as
          | "New Lead"
          | "In Negotiation"
          | "Contract Signed"
          | "Project In Progress"
          | "Completed"
          | "Inactive Client";

        const statusStyles: Record<
          typeof status,
          { text: string; dot: string }
        > = {
          "New Lead": {
            text: "text-white bg-[#00A400] border-none rounded-full",
            dot: "bg-white",
          },
          "In Negotiation": {
            text: "text-white bg-[#640D5F] border-none rounded-full",
            dot: "bg-white",
          },
          "Contract Signed": {
            text: "text-white bg-[#000000] border-none rounded-full",
            dot: "bg-white",
          },
          "Project In Progress": {
            text: "text-white bg-[#EB5B00] border-none rounded-full",
            dot: "bg-white",
          },
          Completed: {
            text: "text-white bg-[#4300FF] border-none rounded-full",
            dot: "bg-white",
          },
          "Inactive Client": {
            text: "text-white bg-[#B12C00] border-none rounded-full",
            dot: "bg-white",
          },
        };

        // Default style if status is not found
        const defaultStyle = {
          text: "text-white bg-gray-500 border-none rounded-full",
          dot: "bg-white",
        };

        const currentStyle = statusStyles[status] || defaultStyle;

        const statusOptions: Array<{
          value: typeof status;
          label: string;
        }> = [
          { value: "New Lead", label: "New Lead" },
          { value: "In Negotiation", label: "In Negotiation" },
          { value: "Contract Signed", label: "Contract Signed" },
          { value: "Project In Progress", label: "Project In Progress" },
          { value: "Completed", label: "Completed" },
          { value: "Inactive Client", label: "Inactive Client" },
        ];

        return (
          <Center>
            <Select
              value={status}
              onValueChange={(newStatus) =>
                handleStatusChange(row.original.id, newStatus)
              }
              disabled={isUpdatingStatus}
            >
              <SelectTrigger
                className={`rounded-md capitalize w-38 h-12 gap-2 border justify-center items-center ${currentStyle.text} cursor-pointer hover:opacity-90`}
              >
                <SelectValue>
                  <Center className="gap-2">
                    <Flex
                      className={`w-2 h-2 items-start rounded-full ${currentStyle.dot}`}
                    />
                    <h1>{status || "Unknown"}</h1>
                  </Center>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => {
                  const optionStyle =
                    statusStyles[option.value] || defaultStyle;
                  return (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="cursor-pointer"
                    >
                      <Flex
                        className={`rounded-md capitalize gap-2 border justify-center items-center px-3 py-1 ${optionStyle.text}`}
                      >
                        <Flex
                          className={`w-2 h-2 items-start rounded-full ${optionStyle.dot}`}
                        />
                        <span>{option.label}</span>
                      </Flex>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </Center>
        );
      },
    },

    {
      accessorKey: "actions",
      header: () => <Box className="text-center text-black">Actions</Box>,
      cell: ({ row }) => {
        return (
          <Center className="space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-[#23B95D] border-none w-9 h-9 hover:bg-[#23B95D]/80 cursor-pointer rounded-md "
                    onClick={() => openEditClientModal(row.original)}
                  >
                    <Pencil className="text-white size-5 " />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="mb-2">
                  <p>Edit Client</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-[#2358B9] border-none w-9 h-9 hover:bg-[#2358B9]/80 cursor-pointer rounded-md "
                    onClick={() => openViewClientModal(row.original)}
                  >
                    <Eye className="text-white size-5 " />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="mb-2">
                  <p>View Client</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-[#A50403] border-none w-9 h-9 hover:bg-[#A50403]/80 cursor-pointer rounded-md "
                    onClick={() =>
                      handleDeleteClient(row.original.id, row.original.name)
                    }
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="text-white fill-white size-4 animate-spin" />
                    ) : (
                      <FaRegTrashAlt className="text-white fill-white size-4 " />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="mb-2">
                  <p>Delete Client</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Center>
        );
      },
    },
  ];

  // Transform API data to match table format
  const tableData: Data[] =
    clientsData?.data?.map((client: any) => ({
      id: client.id,
      status: client.status,
      email: client.email,
      phone: client.phone,
      name: client.name,
      cpfcnpj: client.cpfcnpj,
      address: client.address,
      businessIndustry: client.businessIndustry,
      image: client.image,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
      projects: client.projects || [], // Include projects from API
      socialMediaLinks: client.socialMediaLinks
        ? typeof client.socialMediaLinks === "string"
          ? client.socialMediaLinks
          : JSON.stringify(client.socialMediaLinks)
        : undefined,
    })) || mockData;

  // Show loading state
  if (isLoading) {
    return (
      <Center className="py-12">
        <Stack className="gap-4 items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading clients...</p>
        </Stack>
      </Center>
    );
  }

  // Show error state
  if (error) {
    return (
      <Center className="py-12">
        <Stack className="gap-4 items-center">
          <p className="text-red-500">Error loading clients: {error.message}</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </Stack>
      </Center>
    );
  }

  return (
    <>
      <ReusableTable
        data={tableData}
        columns={columns}
        // searchInput={false}
        enablePaymentLinksCalender={true}
      />

      {/* Edit Client Modal */}
      {selectedClient && (
        <GeneralModal open={props.open} onOpenChange={props.onOpenChange}>
          <Box className="w-full h-[36rem] bg-white rounded-xl shadow-lg p-6 gap-4 overflow-y-auto">
            <Stack className="items-center">
              <Box className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                <img
                  src={selectedClient.image}
                  alt="Client"
                  className="text-blue-400 rounded-full w-20 h-20"
                />
              </Box>
              <span className="text-2xl font-bold text-gray-800 capitalize">
                {selectedClient.name}
              </span>
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 mb-2"
                style={{ background: "#F3F4F6", color: "#1797B9" }}
              >
                {selectedClient.status}
              </span>
            </Stack>

            {/* Social Media Links */}
            {selectedClient.socialMediaLinks && (
              <Box className="mt-6">
                <span className="text-lg font-semibold text-gray-800 mb-2 block">
                  Social Media
                </span>
                <Box className="flex flex-wrap gap-3">
                  {(() => {
                    try {
                      const links =
                        typeof selectedClient.socialMediaLinks === "string"
                          ? JSON.parse(selectedClient.socialMediaLinks)
                          : selectedClient.socialMediaLinks;

                      const socialIcons: Record<string, any> = {
                        instagram: FaInstagram,
                        twitter: FaTwitter,
                        facebook: FaFacebook,
                        linkedin: FaLinkedin,
                        youtube: FaYoutube,
                        tiktok: FaTiktok,
                        snapchat: FaSnapchat,
                        pinterest: FaPinterest,
                      };

                      const socialColors: Record<string, string> = {
                        instagram: "#E4405F",
                        twitter: "#1DA1F2",
                        facebook: "#1877F2",
                        linkedin: "#0077B5",
                        youtube: "#FF0000",
                        tiktok: "#000000",
                        snapchat: "#FFFC00",
                        pinterest: "#BD081C",
                      };

                      return Array.isArray(links) && links.length > 0 ? (
                        links.map((link: any, index: number) => {
                          const Icon = socialIcons[link.type] || FaInstagram;
                          const color = socialColors[link.type] || "#000000";
                          return (
                            <a
                              key={index}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <Icon className="w-5 h-5" style={{ color }} />
                              <span className="text-sm text-gray-700 capitalize">
                                {link.type}
                              </span>
                            </a>
                          );
                        })
                      ) : (
                        <Box className="text-center text-gray-500 text-sm">
                          No social media links
                        </Box>
                      );
                    } catch (err) {
                      console.error("Error parsing social media links:", err);
                      return (
                        <Box className="text-center text-gray-500 text-sm">
                          Unable to load social media links
                        </Box>
                      );
                    }
                  })()}
                </Box>
              </Box>
            )}

            <Box className="mt-6">
              <span className="text-lg font-semibold text-gray-800 mb-2 block">
                Projects
              </span>
              {!selectedClient.projects ||
              selectedClient.projects.length === 0 ? (
                <Box className="text-center text-gray-500">
                  No projects found
                </Box>
              ) : (
                <Stack className="gap-4">
                  {selectedClient.projects?.map((project) => (
                    <Box
                      key={project.id}
                      className="border rounded-lg p-4 shadow-sm bg-gray-50"
                    >
                      <Flex className="justify-between items-center mb-2">
                        <span className="font-bold text-gray-700">
                          {project.name}
                        </span>
                        {project.status === "Completed" && (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
                            Completed
                          </span>
                        )}
                      </Flex>
                      <Flex className="items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-gray-600">
                          Status:
                        </span>
                        <span
                          className="text-xs font-semibold"
                          style={{
                            color:
                              project.status === "Completed"
                                ? "#23B95D"
                                : "#1797B9",
                          }}
                        >
                          {project.status}
                        </span>
                      </Flex>
                      <Flex className="items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-gray-600">
                          Completion:
                        </span>
                        <Box className="w-32 h-2 bg-gray-200 rounded">
                          <Box
                            className="h-2 bg-blue-500 rounded"
                            style={{ width: `${project.completionRate}%` }}
                          />
                        </Box>
                        <span className="text-xs font-semibold">
                          {project.completionRate}%
                        </span>
                      </Flex>
                      <Button
                        className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white py-1 px-4 rounded font-semibold shadow hover:from-blue-600 hover:to-cyan-500 transition cursor-pointer mt-2"
                        onClick={() => {
                          // Simulate contract download
                          const blob = new Blob(
                            [
                              `Contract for ${selectedClient.name} - ${project.name}`,
                            ],
                            { type: "text/plain" }
                          );
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = project.contractFile;
                          a.click();
                          window.URL.revokeObjectURL(url);
                        }}
                      >
                        Download Contract
                      </Button>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </Box>
        </GeneralModal>
      )}
    </>
  );
};
