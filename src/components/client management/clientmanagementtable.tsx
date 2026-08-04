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
import { FaRegTrashAlt } from "react-icons/fa";
import { Eye, Pencil, KeyRound } from "lucide-react";
import { useState } from "react";
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
    | "Contacted"
    | "Qualified"
    | "Proposal Sent"
    | "Contract Signed"
    | "Project In Progress"
    | "Completed"
    | "Inactive"
    | "Lost";
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
  portalAccessEnabled?: boolean;
  followUpAt?: string | null;
  followUpNote?: string | null;
};

const PAGE_SIZE = 10;

export const ClientManagementTable = () => {
  const { t } = useTranslation();

  // Client-side pagination state
  const [pageIndex, setPageIndex] = useState(0);

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

  const openViewClientPage = (client: Data) => {
    navigate(`/dashboard/client-management/${client.id}`);
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

  const openGrantPortalAccessModal = (client: Data) => {
    navigate("/dashboard/client-management/create-client", {
      state: {
        mode: "edit",
        client: client,
        focusPortalAccess: true,
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
        <Box className="text-foreground ps-4">{t("table.name")}</Box>
      ),
      cell: ({ row }) => (
        <Flex className="capitalize ps-4 min-w-[220px] max-sm:w-full gap-3">
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
        const status = row.original.status as string;

        const statusStyles: Record<string, { text: string; dot: string }> = {
          Active: { text: "text-white bg-green-600 border-none rounded-full", dot: "bg-white" },
          Onboarding: { text: "text-white bg-blue-500 border-none rounded-full", dot: "bg-white" },
          "On Hold": { text: "text-white bg-amber-500 border-none rounded-full", dot: "bg-white" },
          Inactive: { text: "text-white bg-gray-500 border-none rounded-full", dot: "bg-white" },
          Completed: { text: "text-white bg-emerald-600 border-none rounded-full", dot: "bg-white" },
          Churned: { text: "text-white bg-rose-500 border-none rounded-full", dot: "bg-white" },
        };

        const defaultStyle = {
          text: "text-white bg-muted/500 border-none rounded-full",
          dot: "bg-white",
        };

        const currentStyle = statusStyles[status] || defaultStyle;

        const statusOptions: Array<{ value: string; label: string }> = [
          { value: "Active", label: translateClientStatus("Active") },
          { value: "Onboarding", label: translateClientStatus("Onboarding") },
          { value: "On Hold", label: translateClientStatus("On Hold") },
          { value: "Inactive", label: translateClientStatus("Inactive") },
          { value: "Completed", label: translateClientStatus("Completed") },
          { value: "Churned", label: translateClientStatus("Churned") },
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
                    onClick={() => openViewClientPage(row.original)}
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
                    onClick={() => openGrantPortalAccessModal(row.original)}
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
      followUpAt: client.followUpAt ?? null,
      followUpNote: client.followUpNote ?? null,
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

  // Pagination calculations (must be after early returns)
  const total = tableData.length;
  const pageCount = Math.ceil(total / PAGE_SIZE);
  const paginatedData = tableData.slice(
    pageIndex * PAGE_SIZE,
    (pageIndex + 1) * PAGE_SIZE,
  );

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
        data={paginatedData}
        columns={columns}
        enablePaymentLinksCalender={true}
        onReorderComplete={handleReorderComplete}
        onDragStart={() => {}}
        onDragEnd={() => {}}
        isReorderingDisabled={isUpdatingPositions}
        dragHandleCell={true}
        pagination={{
          pageIndex,
          pageSize: PAGE_SIZE,
          pageCount,
          total,
          onPageChange: (newPage) => setPageIndex(newPage),
        }}
      />
    </>
  );
};

