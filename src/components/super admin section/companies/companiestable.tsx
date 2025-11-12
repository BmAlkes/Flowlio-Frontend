import { ColumnDef } from "@tanstack/react-table";
import { Center } from "@/components/ui/center";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Eye } from "lucide-react";
import { ReusableTable } from "@/components/reusable/reusabletable";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { FaRegTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router";
import { useFetchAllOrganizations } from "@/hooks/usefetchallorganizations";
import { useState } from "react";
import { DeleteOrganizationModal } from "./DeleteOrganizationModal";

// Define the actual data structure from the API (userOrganizations with nested organization)
export type OrganizationData = {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  status: string;
  permissions: any;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
  organization: {
    id: string;
    name: string;
    slug: string;
    description: string;
    website?: string;
    industry?: string;
    size?: string;
    subscriptionPlanId: string;
    subscriptionStatus: string;
    subscriptionStartDate: string;
    trialEndsAt: string;
    maxUsers: number;
    maxProjects: number;
    maxStorage: number;
    settings: any;
    createdAt: string;
    updatedAt: string;
    subscriptionPlan?: {
      id: string;
      name: string;
      slug: string;
      description: string;
      price: string;
      currency: string;
      billingCycle: string;
      features: any;
    };
  };
};

export const CompaniesTable = () => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const {
    data: allOrganizationsResponse,
    isLoading,
    error,
  } = useFetchAllOrganizations();

  // The API returns userOrganizations array directly
  const transformedData: OrganizationData[] =
    allOrganizationsResponse?.data || [];

  const handleDeleteClick = (organization: any) => {
    setSelectedOrganization({
      id: organization.id,
      name: organization.name,
    });
    setDeleteModalOpen(true);
  };

  const handleDeleteModalClose = () => {
    setDeleteModalOpen(false);
    setSelectedOrganization(null);
  };

  const getColumns = (
    navigate: ReturnType<typeof useNavigate>
  ): ColumnDef<any>[] => [
    {
      id: "select",
      header: () => <Box className="text-center text-black">ID</Box>,
      cell: ({ row }) => (
        <Box className="text-center">#{row.original.id.slice(0, 8)}</Box>
      ),
      enableSorting: false,
    },

    {
      accessorKey: "name",
      header: () => <Box className="text-black py-3 px-3">Company Name</Box>,
      cell: ({ row }) => (
        <Box className="capitalize py-3 px-3 max-sm:w-full">
          {row.original.name || "N/A"}
        </Box>
      ),
    },

    {
      accessorKey: "registeredEmail",
      header: () => <Box className="text-black text-start">Email</Box>,
      cell: ({ row }) => {
        const userOrganizations = row.original.userOrganizations as
          | Array<{
              role?: string;
              user?: { email?: string };
            }>
          | undefined;

        const ownerEmail = userOrganizations?.find((uo) => uo.role === "owner")
          ?.user?.email;

        const fallbackEmail = userOrganizations?.[0]?.user?.email;

        const email = ownerEmail || fallbackEmail || "N/A";

        return <Box className="captialize text-start">{email}</Box>;
      },
    },
    {
      accessorKey: "createdAt",
      header: () => (
        <Box className="text-black text-center">Registration On</Box>
      ),
      cell: ({ row }) => (
        <Box className="captialize text-center">
          {new Date(row.original.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Box>
      ),
    },

    {
      accessorKey: "subscriptionPlan.name",
      header: () => <Box className="text-center text-black">Subscription</Box>,
      cell: ({ row }) => {
        return (
          <Box className="text-center">
            {row.original.subscriptionPlan?.name || "N/A"}
          </Box>
        );
      },
    },

    {
      accessorKey: "subscriptionStatus",
      header: () => <Box className="text-center text-black">Status</Box>,
      cell: ({ row }) => {
        const status = row.original.subscriptionStatus as
          | "active"
          | "inActive"
          | "expired"
          | "cancelled";

        const statusStyles: Record<string, { text: string; dot: string }> = {
          active: {
            text: "text-white bg-[#00A400] border-none rounded-full",
            dot: "bg-white",
          },
          inActive: {
            text: "text-white bg-[#F98618] border-none rounded-full",
            dot: "bg-white",
          },
          expired: {
            text: "text-white bg-red-500 border-none rounded-full",
            dot: "bg-white",
          },
          cancelled: {
            text: "text-white bg-gray-500 border-none rounded-full",
            dot: "bg-white",
          },
        };

        const currentStatus = statusStyles[status] || statusStyles.inActive;

        return (
          <Center>
            <Flex
              className={`rounded-md capitalize w-28 h-10 gap-2 border items-center ${currentStatus.text}`}
            >
              <Flex className="ml-5.5">
                <Flex className={`w-2 h-2 rounded-full ${currentStatus.dot}`} />
                <span>{status}</span>
              </Flex>
            </Flex>
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
                    onClick={() => {
                      // Use the actual slug field from the database
                      const slug = row.original.slug;
                      navigate(`/superadmin/companies/details/${slug}`);
                    }}
                    variant="outline"
                    className="bg-black border-none w-10 h-9 hover:bg-black cursor-pointer rounded-md "
                  >
                    <Eye className="fill-white size-7 " />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="mb-2">
                  <p>View Details</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => handleDeleteClick(row.original)}
                    variant="outline"
                    className="bg-[#A50403] border-none w-9 h-9 hover:bg-[#A50403]/80 cursor-pointer rounded-md "
                  >
                    <FaRegTrashAlt className="text-white fill-white size-4 " />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="mb-2">
                  <p>Delete Company</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Center>
        );
      },
    },
  ];

  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Box className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading organizations...</p>
        </div>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading organizations</p>
        </div>
      </Box>
    );
  }

  return (
    <>
      <ReusableTable
        data={transformedData}
        columns={getColumns(navigate)}
        // searchInput={false}
        enablePaymentLinksCalender={true}
        onRowClick={(row) => console.log("Row clicked:", row.original)}
      />

      {selectedOrganization && (
        <DeleteOrganizationModal
          isOpen={deleteModalOpen}
          onClose={handleDeleteModalClose}
          organizationId={selectedOrganization.id}
          organizationName={selectedOrganization.name}
        />
      )}
    </>
  );
};
