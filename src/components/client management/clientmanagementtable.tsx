import { ColumnDef } from "@tanstack/react-table";
import { Center } from "@/components/ui/center";
import { Box } from "../ui/box";
import { Flex } from "../ui/flex";
import { DraggableTable } from "../reusable/draggabletable";
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
import { Eye, Pencil, KeyRound } from "lucide-react";
import {
  GeneralModal,
  useGeneralModalDisclosure,
} from "../common/generalmodal";
import { useState } from "react";
import { Stack } from "../ui/stack";
import { useFetchOrganizationClients } from "@/hooks/usefetchclients";
import { useDeleteClient } from "@/hooks/usedeleteclient";
import { useUpdateClient } from "@/hooks/useupdateclient";
import { useBulkUpdateClientPositions } from "@/hooks/useBulkUpdateClientPositions";
import { useFetchCustomFields } from "@/hooks/usecustomfields";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { TableSkeleton, ErrorState } from "@/components/skeletons";
import { ClientTimeline } from "./ClientTimeline";
// import { GrantAccessModal } from "./GrantAccessModal";

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
    position: 0,
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
  customFields?: Record<string, any>;
  position?: number; // Order field for drag-and-drop
};

export const ClientManagementTable = () => {
  const { t } = useTranslation();
  const props = useGeneralModalDisclosure();
  const [selectedClient, setSelectedClient] = useState<Data | null>(null);

  // const [grantAccessClient, setGrantAccessClient] = useState<Data | null>(null);
  const navigate = useNavigate();

  const translateClientStatus = (status: string) =>
    t(`clientManagement.clientStatuses.${status}`, { defaultValue: status });

  // Fetch clients from API
  const {
    data: clientsData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useFetchOrganizationClients();

  const loading = isLoading || isFetching;

  // Fetch custom field definitions for clients
  const { data: customFieldsData } = useFetchCustomFields("client");

  const { mutate: deleteClient, isPending: isDeleting } = useDeleteClient();
  const { mutate: updateClient, isPending: isUpdatingStatus } =
    useUpdateClient();
  const { mutate: bulkUpdatePositions, isPending: isUpdatingPositions } =
    useBulkUpdateClientPositions();

  const handleStatusChange = (clientId: string, newStatus: string) => {
    updateClient(
      {
        clientId,
        data: { status: newStatus },
      },
      {
        onSuccess: () => {
          toast.success(t("clientManagement.toastStatusUpdated"));
          refetch();
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.error ||
              t("clientManagement.toastStatusFailed"),
          );
        },
      },
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
    if (window.confirm(t("clientManagement.confirmDelete", { email }))) {
      try {
        deleteClient(id);
        toast.success(t("clientManagement.toastDeleted"));
        refetch();
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          t("clientManagement.toastDeleteFailed");
        toast.error(errorMessage);
      }
    }
  };

  // Define columns inside the component to access the functions
  const columns: ColumnDef<Data>[] = [
    {
      accessorKey: "name",
      header: () => (
        <Box className="text-foreground pl-4">{t("table.name")}</Box>
      ),
      cell: ({ row }) => (
        <Flex className="capitalize pl-4 min-w-[220px] max-sm:w-full gap-3">
          <Avatar className="size-8">
            <AvatarImage
              src={row.original.image || "https://github.com/shadcn.png"}
            />
            <AvatarFallback>
              {row.original.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <span className="truncate">
            {row.original.name.length > 25
              ? row.original.name.slice(0, 25) + "..."
              : row.original.name}
          </span>
        </Flex>
      ),
    },

    {
      accessorKey: "cpfcnpj",
      header: () => (
        <Box className="text-foreground text-center min-w-[140px]">
          {t("table.vat")}
        </Box>
      ),
      cell: ({ row }) => (
        <Box className="captialize text-center min-w-[140px]">
          {row.original.cpfcnpj || t("clientManagement.notAvailable")}
        </Box>
      ),
    },

    {
      accessorKey: "address",
      header: () => (
        <Box className="text-foreground text-center min-w-[180px]">
          {t("table.address")}
        </Box>
      ),
      cell: ({ row }) => (
        <Box className="captialize text-center min-w-[180px]">
          {row.original.address || t("clientManagement.notAvailable")}
        </Box>
      ),
    },
    {
      accessorKey: "email",
      header: () => (
        <Box className="text-foreground text-center min-w-[200px]">
          {t("table.email")}
        </Box>
      ),
      cell: ({ row }) => (
        <Box className="captialize text-center min-w-[200px]">
          {row.original.email || t("clientManagement.notAvailable")}
        </Box>
      ),
    },

    // {
    //   id: "social",
    //   header: () => (
    //     <Box className="text-center text-foreground">{t("table.social")}</Box>
    //   ),
    //   cell: ({ row }) => {
    //     const socialLinks = row.original.socialMediaLinks
    //       ? typeof row.original.socialMediaLinks === "string"
    //         ? JSON.parse(row.original.socialMediaLinks)
    //         : row.original.socialMediaLinks
    //       : [];

    //     const socialIcons: Record<string, any> = {
    //       instagram: FaInstagram,
    //       twitter: FaTwitter,
    //       facebook: FaFacebook,
    //       linkedin: FaLinkedin,
    //       youtube: FaYoutube,
    //       tiktok: FaTiktok,
    //       snapchat: FaSnapchat,
    //       pinterest: FaPinterest,
    //     };

    //     const socialColors: Record<string, string> = {
    //       instagram: "#E4405F",
    //       twitter: "#1DA1F2",
    //       facebook: "#1877F2",
    //       linkedin: "#0077B5",
    //       youtube: "#FF0000",
    //       tiktok: "#000000",
    //       snapchat: "#FFFC00",
    //       pinterest: "#BD081C",
    //     };

    //     return (
    //       <Popover>
    //         <PopoverTrigger asChild>
    //           <Button
    //             variant="ghost"
    //             className="w-8 h-8 p-0 flex items-center justify-center cursor-pointer"
    //           >
    //             <Ellipsis className="text-muted-foreground" />
    //           </Button>
    //         </PopoverTrigger>
    //         <PopoverContent className="w-64">
    //           <Box className="text-sm font-semibold mb-3">
    //             {t("clientManagement.contactSocial")}
    //           </Box>
    //           <Box className="mb-2">
    //             <span className="font-medium text-xs">
    //               {t("clientManagement.emailLabel")}
    //             </span>{" "}
    //             <span className="text-xs">{row.original.email}</span>
    //           </Box>
    //           <Box className="mb-3">
    //             <span className="font-medium text-xs">
    //               {t("clientManagement.phoneLabel")}
    //             </span>{" "}
    //             <span className="text-xs">
    //               {row.original.phone || t("clientManagement.notAvailable")}
    //             </span>
    //           </Box>
    //           {Array.isArray(socialLinks) && socialLinks.length > 0 && (
    //             <>
    //               <Box className="text-sm font-semibold mb-2 mt-3 pt-3 border-t">
    //                 {t("clientManagement.socialMedia")}
    //               </Box>
    //               <Box className="flex flex-wrap gap-2">
    //                 {socialLinks.map((link: any, index: number) => {
    //                   const Icon = socialIcons[link.type] || FaInstagram;
    //                   const color = socialColors[link.type] || "#000000";
    //                   return (
    //                     <a
    //                       key={index}
    //                       href={link.url}
    //                       target="_blank"
    //                       rel="noopener noreferrer"
    //                       className="flex items-center gap-1 p-1.5 border border-border rounded hover:bg-muted/50 transition-colors"
    //                       title={link.type}
    //                     >
    //                       <Icon className="w-4 h-4" style={{ color }} />
    //                     </a>
    //                   );
    //                 })}
    //               </Box>
    //             </>
    //           )}
    //         </PopoverContent>
    //       </Popover>
    //     );
    //   },
    // },

    {
      accessorKey: "businessIndustry",
      header: () => (
        <Box className="text-foreground text-center min-w-[140px]">
          {t("table.industry")}
        </Box>
      ),
      cell: ({ row }) => (
        <Box className="captialize text-center min-w-[140px]">
          {row.original.businessIndustry || t("clientManagement.notAvailable")}
        </Box>
      ),
    },

    {
      accessorKey: "status",
      header: () => (
        <Box className="text-center text-foreground">{t("table.status")}</Box>
      ),
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
          text: "text-white bg-muted/500 border-none rounded-full",
          dot: "bg-white",
        };

        const currentStyle = statusStyles[status] || defaultStyle;

        const statusOptions: Array<{
          value: typeof status;
          label: string;
        }> = [
          { value: "New Lead", label: translateClientStatus("New Lead") },
          {
            value: "In Negotiation",
            label: translateClientStatus("In Negotiation"),
          },
          {
            value: "Contract Signed",
            label: translateClientStatus("Contract Signed"),
          },
          {
            value: "Project In Progress",
            label: translateClientStatus("Project In Progress"),
          },
          { value: "Completed", label: translateClientStatus("Completed") },
          {
            value: "Inactive Client",
            label: translateClientStatus("Inactive Client"),
          },
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
                className={`rounded-md capitalize w-32 h-12 gap-2 border justify-center items-center ${currentStyle.text} cursor-pointer hover:opacity-90`}
              >
                <SelectValue>
                  <Center className="gap-2">
                    <Flex
                      className={`w-2 h-2 items-start rounded-full ${currentStyle.dot}`}
                    />
                    <h2 className="text-sm">
                      {status
                        ? translateClientStatus(status)
                        : t("clientManagement.unknown")}
                    </h2>
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

    // Dynamic Custom Columns
    ...(customFieldsData?.data.map((field) => ({
      accessorKey: `customFields.${field.id}`,
      id: field.id,
      header: () => (
        <Box className="text-center text-foreground p-1 whitespace-nowrap min-w-[120px]">
          {field.name}
        </Box>
      ),
      cell: ({ row }: { row: any }) => {
        const val = row.original.customFields?.[field.id];
        if (val === undefined || val === null || val === "")
          return <Box className="text-center p-1 min-w-[120px]">-</Box>;

        if (field.type === "select" && field.options) {
          const option = field.options.find((opt: any) => opt.label === val);
          if (option) {
            return (
              <Center className="min-w-[120px]">
                <Flex className="items-center gap-2 px-2 py-1 bg-muted/50 rounded-full border border-border text-xs overflow-hidden">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: option.color }}
                  />
                  <span className="capitalize truncate max-w-[100px]">{val}</span>
                </Flex>
              </Center>
            );
          }
        }

        let displayValue = val;
        if (field.type === "boolean") {
          displayValue =
            val === "true" || val === true
              ? t("clientManagement.yes")
              : t("clientManagement.no");
        } else if (field.type === "date" && val) {
          try {
            displayValue = new Date(val).toLocaleDateString();
          } catch (e) {
            displayValue = val;
          }
        }

        return (
          <Box className="text-center p-1 capitalize min-w-[120px] truncate max-w-[200px]" title={String(displayValue)}>
            {String(displayValue)}
          </Box>
        );
      },
    })) || []),

    {
      accessorKey: "actions",
      header: () => (
        <Box className="text-center text-foreground">{t("common.actions")}</Box>
      ),
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
                  <p>{t("clientManagement.editClient")}</p>
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
                  <p>{t("clientManagement.viewClient")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-amber-500 border-none w-9 h-9 hover:bg-amber-600 cursor-pointer rounded-md text-white"
                    // onClick={() => setGrantAccessClient(row.original)}
                  >
                    <KeyRound className="text-white size-5 " />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="mb-2">
                  <p>{t("clientManagement.grantPortalAccess")}</p>
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
                      handleDeleteClient(
                        row.original.id,
                        row.original.email || row.original.name,
                      )
                    }
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Box className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FaRegTrashAlt className="size-4 text-white" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="mb-2">
                  <p>{t("clientManagement.deleteClient")}</p>
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
      customFields: client.customFields || {},
      position: client.position || 0,
    })) || mockData;

  // Handle reorder completion
  const handleReorderComplete = (
    _reorderedClients: Data[],
    updates: Array<{ id: string; position: number }>,
  ) => {
    // Update positions via API
    bulkUpdatePositions(
      updates.map((update) => ({
        clientId: update.id,
        position: update.position,
      })),
      {
        onSuccess: () => {
          toast.success(
            t("clientManagement.toastReordered", {
              defaultValue: "Clients reordered successfully",
            }),
          );
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.error ||
              t("clientManagement.toastReorderFailed", {
                defaultValue: "Failed to reorder clients",
              }),
          );
          refetch(); // Refetch to restore original order on error
        },
      },
    );
  };

  // Show loading state
  if (loading) {
    return <TableSkeleton rows={8} columns={6} withAvatar withActions />;
  }

  // Show error state
  if (error) {
    return (
      <ErrorState
        title={t("clientManagement.errorLoading")}
        message={error.message}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <>
      {/* {grantAccessClient && (
        <GrantAccessModal
          open={!!grantAccessClient}
          onOpenChange={(open) => !open && setGrantAccessClient(null)}
          clientId={grantAccessClient.id}
          clientName={grantAccessClient.name}
          onSuccess={() => {
            refetch();
            setGrantAccessClient(null);
          }}
        />
      )} */}
      <DraggableTable
        data={tableData}
        columns={columns}
        enablePaymentLinksCalender={true}
        onReorderComplete={handleReorderComplete}
        onDragStart={() => {}}
        onDragEnd={() => {}}
        isReorderingDisabled={isUpdatingPositions}
        dragHandleCell={true}
      />

      {/* Edit Client Modal */}
      {selectedClient && (
        <GeneralModal open={props.open} onOpenChange={props.onOpenChange} contentProps={{ className: "sm:max-w-5xl w-[95vw] p-0" }}>
          <Box className="w-full bg-card rounded-xl border-none overflow-y-auto max-h-[90vh]">
            <Flex className="items-start max-md:flex-col h-full min-h-[600px]">
              {/* Left Column: Profile, Social, Projects */}
              <Box className="flex-1 p-8 space-y-8 min-w-0 border-r border-border/50 max-md:border-r-0 max-md:border-b">
                <Stack className="items-center">
                  <Box className="w-32 h-32 rounded-full bg-muted flex items-center justify-center mb-4 ring-4 ring-indigo-50 shadow-lg dark:ring-indigo-900/20">
                    <img
                      src={selectedClient.image || "https://github.com/shadcn.png"}
                      alt="Client"
                      className="rounded-full w-full h-full object-cover"
                    />
                  </Box>
                  <span className="text-4xl font-black text-foreground capitalize text-center tracking-tight">
                    {selectedClient.name}
                  </span>
                  <span className="inline-block px-5 py-2 rounded-full text-xs font-black mt-3 bg-indigo-600 text-white shadow-md">
                    {translateClientStatus(selectedClient.status)}
                  </span>
                </Stack>

            {/* Social Media Links */}
            {selectedClient.socialMediaLinks && (
              <Box className="mt-6">
                <span className="text-lg font-semibold text-foreground mb-2 block">
                  {t("clientManagement.viewModal.socialMedia")}
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
                              className="flex items-center gap-2 p-2 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <Icon className="w-5 h-5" style={{ color }} />
                              <span className="text-sm text-foreground capitalize">
                                {link.type}
                              </span>
                            </a>
                          );
                        })
                      ) : (
                        <Box className="text-center text-muted-foreground text-sm">
                          {t("clientManagement.viewModal.noSocialLinks")}
                        </Box>
                      );
                    } catch (err) {
                      console.error("Error parsing social media links:", err);
                      return (
                        <Box className="text-center text-muted-foreground text-sm">
                          {t("clientManagement.viewModal.loadSocialError")}
                        </Box>
                      );
                    }
                  })()}
                </Box>
              </Box>
            )}

            {/* Custom Fields Section */}
            {customFieldsData?.data &&
              customFieldsData.data.length > 0 &&
              selectedClient.customFields &&
              Object.keys(selectedClient.customFields).length > 0 && (
                <Box className="mt-6">
                  <span className="text-lg font-semibold text-gray-800 mb-2 block">
                    {t("clientManagement.viewModal.customFields")}
                  </span>
                  <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                    {customFieldsData.data.map((field) => {
                      const value = selectedClient.customFields?.[field.id];
                      if (value === undefined || value === null || value === "")
                        return null;

                      let displayValue = value;
                      if (field.type === "boolean") {
                        displayValue =
                          value === "true" || value === true
                            ? t("clientManagement.yes")
                            : t("clientManagement.no");
                      } else if (field.type === "date" && value) {
                        try {
                          displayValue = new Date(value).toLocaleDateString();
                        } catch (e) {
                          displayValue = value;
                        }
                      }

                      return (
                        <Box
                          key={field.id}
                          className="p-3 border border-border rounded-lg bg-gray-50/50 flex flex-col overflow-hidden min-w-0"
                        >
                          <span className="text-xs font-medium text-muted-foreground block truncate mb-1" title={field.name}>
                            {field.name}
                          </span>
                          <Flex className="items-start gap-2">
                            {field.type === "select" && field.options && (
                              <div
                                className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                                style={{
                                  backgroundColor:
                                    field.options.find(
                                      (opt: any) => opt.label === value,
                                    )?.color || "transparent",
                                }}
                              />
                            )}
                            <span className="text-sm text-gray-800 font-semibold break-words overflow-hidden break-all" style={{ wordBreak: 'break-word' }}>
                              {String(displayValue)}
                            </span>
                          </Flex>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}

            <Box className="mt-6">
              <span className="text-lg font-semibold text-gray-800 mb-2 block">
                {t("clientManagement.viewModal.projects")}
              </span>
              {!selectedClient.projects ||
              selectedClient.projects.length === 0 ? (
                <Box className="text-center text-muted-foreground">
                  {t("clientManagement.viewModal.noProjects")}
                </Box>
              ) : (
                <Stack className="gap-4">
                  {selectedClient.projects?.map((project) => (
                    <Box
                      key={project.id}
                      className="border rounded-lg p-4 shadow-sm bg-muted/50"
                    >
                      <Flex className="justify-between items-center mb-2">
                        <span className="font-bold text-foreground">
                          {project.name}
                        </span>
                        {project.status === "Completed" && (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
                            {t("clientManagement.viewModal.completed")}
                          </span>
                        )}
                      </Flex>
                      <Flex className="items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          {t("clientManagement.viewModal.statusLabel")}
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
                          {translateClientStatus(project.status)}
                        </span>
                      </Flex>
                      <Flex className="items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          {t("clientManagement.viewModal.completionLabel")}
                        </span>
                        <Box className="w-32 h-2 bg-muted rounded">
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
                        className="bg-gradient-to-r from-blue-500/50 to-cyan-400 text-white py-1 px-4 rounded font-semibold shadow hover:from-blue-600 hover:to-cyan-500 transition cursor-pointer mt-2"
                        onClick={async () => {
                          const rawUrl = project.contractFile;
                          if (!rawUrl) {
                            alert(
                              t("clientManagement.viewModal.noContractFile", {
                                defaultValue: "No contract file available.",
                              }),
                            );
                            return;
                          }

                          try {
                            const urlFilename =
                              rawUrl.split("/").pop()?.split("?")[0] ||
                              `contract-${selectedClient.name}-${project.name}.pdf`;

                            // Inject fl_attachment to Cloudinary URLs
                            let downloadUrl = rawUrl;
                            if (
                              rawUrl.includes("cloudinary.com") &&
                              !rawUrl.includes("fl_attachment")
                            ) {
                              downloadUrl = rawUrl.replace(
                                "/upload/",
                                "/upload/fl_attachment/",
                              );
                            }

                            // Fetch as blob to force a local download instead of opening a new tab
                            const response = await fetch(downloadUrl);
                            if (!response.ok)
                              throw new Error("Network response was not ok");
                            const blob = await response.blob();
                            const blobUrl = window.URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = blobUrl;
                            a.download = urlFilename;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(blobUrl);
                          } catch (err) {
                            // Fallback to opening the modified URL
                            let fallbackUrl = rawUrl;
                            if (
                              rawUrl.includes("cloudinary.com") &&
                              !rawUrl.includes("fl_attachment")
                            ) {
                              fallbackUrl = rawUrl.replace(
                                "/upload/",
                                "/upload/fl_attachment/",
                              );
                            }
                            window.open(fallbackUrl, "_blank");
                          }
                        }}
                      >
                        {t("clientManagement.viewModal.downloadContract")}
                      </Button>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

              </Box>

              {/* Right Column: Interaction Timeline */}
              <Box className="w-[380px] max-md:w-full p-8 bg-muted/20 h-full flex flex-col border-l border-border/50 max-md:border-l-0">
                <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <span className="w-2 h-6 bg-indigo-600 rounded-full" />
                  Activity Timeline
                </h3>
                <Box className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <ClientTimeline clientId={selectedClient.id} />
                </Box>
              </Box>
            </Flex>
          </Box>
        </GeneralModal>
      )}
    </>
  );
};
