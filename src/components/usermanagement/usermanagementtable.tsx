import { ColumnDef } from "@tanstack/react-table";
import { Center } from "@/components/ui/center";
import { Box } from "../ui/box";
import { Flex } from "../ui/flex";
import { ReusableTable } from "../reusable/reusabletable";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { FaRegTrashAlt } from "react-icons/fa";
import {
  useDeleteUserMember,
  useDeactivateUserMember,
  useReactivateUserMember,
} from "@/hooks/usedeleteusermember";
import { toast } from "sonner";

export type Data = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phonenumber: string;
  userrole: string;
  companyname: string;
  setpermission: string;
  status: string;
  isActive: boolean;
  organizationId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  loginAttempts: number;
  lockedUntil: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    image: string | null;
    emailVerified: boolean;
    isSuperAdmin: boolean;
  } | null;
  userOrganization: {
    id: string;
    role: string;
    permissions: any;
    status: string;
    joinedAt: string;
  } | null;
};

export const columns: ColumnDef<Data>[] = [
  {
    accessorKey: "firstname",
    header: () => <Box className="text-black pl-4">Name</Box>,
    cell: ({ row }) => (
      <Flex className="capitalize pl-4 w-30 max-sm:w-full">
        <Avatar className="size-8">
          <AvatarImage
            src={row.original.user?.image || "https://github.com/shadcn.png"}
          />
          <AvatarFallback>
            {row.original.firstname.charAt(0)}
            {row.original.lastname.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <Box className="ml-2">
          <Box className="font-medium">
            {`${row.original.firstname} ${row.original.lastname}`}
          </Box>
        </Box>
      </Flex>
    ),
  },
  {
    accessorKey: "email",
    header: () => (
      <Box className="text-black text-start w-26 max-lg:w-full font-medium">
        Email
      </Box>
    ),
    cell: ({ row }) => (
      <Flex className="items-start justify-start gap-2 w-26 max-lg:w-full">
        <Box className="text-sm">{row.original.email}</Box>
      </Flex>
    ),
  },
  {
    accessorKey: "companyname",
    header: () => <Box className="text-black text-center">Company</Box>,
    cell: ({ row }) => (
      <Box className="capitalize text-center">{row.original.companyname}</Box>
    ),
  },
  {
    accessorKey: "userrole",
    header: () => <Box className="text-center text-black">Role</Box>,
    cell: ({ row }) => {
      return (
        <Center className="text-center capitalize">
          {row.original.userrole}
        </Center>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: () => <Box className="text-center text-black">Added On</Box>,
    cell: ({ row }) => {
      const createdAt = new Date(row.original.createdAt);
      try {
        return (
          <Box className="text-center">{format(createdAt, "MMM d, yyyy")}</Box>
        );
      } catch {
        console.error("Invalid date:", createdAt);
        return <Box className="text-center">Invalid Date</Box>;
      }
    },
  },
  {
    accessorKey: "status",
    header: () => <Box className="text-center text-black">Status</Box>,
    cell: ({ row }) => {
      const isActive = row.original.isActive;

      const statusStyles: Record<string, { text: string; dot: string }> = {
        active: {
          text: "text-white bg-[#00A400] border-none rounded-full",
          dot: "bg-white",
        },
        inactive: {
          text: "text-white bg-[#A50403] border-none rounded-full",
          dot: "bg-white",
        },
      };

      const currentStatus = isActive ? "active" : "inactive";

      return (
        <Center>
          <Flex
            className={`rounded-md capitalize w-30 h-10 gap-2 border justify-center items-center ${statusStyles[currentStatus].text}`}
          >
            <Center className="gap-2">
              <Flex
                className={`w-2 h-2 items-start rounded-full ${statusStyles[currentStatus].dot}`}
              />
              <h1>{currentStatus}</h1>
            </Center>
          </Flex>
        </Center>
      );
    },
  },
  {
    accessorKey: "actions",
    header: () => <Box className="text-center text-black">Actions</Box>,
    cell: ({ row }) => {
      const { id } = row.original;

      return (
        <Center className="space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-[#A50403] text-white border-none w-9 h-9 hover:bg-[#A50403]/80 cursor-pointer rounded-md"
                  onClick={() => console.log("Delete user:", id)}
                >
                  <FaRegTrashAlt className="text-white size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="mb-2">
                <p>Delete User</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Center>
      );
    },
  },
];

export const UserManagementTable = ({
  userMembers,
  error,
  isLoading,
  refetch,
}: {
  userMembers: Data[];
  error: any;
  isLoading: boolean;
  refetch: () => void;
}) => {
  // Delete user member hook
  const deleteUserMember = useDeleteUserMember();
  const deactivateUserMember = useDeactivateUserMember();
  const reactivateUserMember = useReactivateUserMember();

  // Handle delete user member
  const handleDeleteUserMember = async (id: string, email: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${email}? This action cannot be undone.`
      )
    ) {
      try {
        await deleteUserMember.mutateAsync(id);
        toast.success("User member deleted successfully");
        refetch();
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message || "Failed to delete user member";
        toast.error(errorMessage);
      }
    }
  };

  // Handle deactivate/reactivate user member
  const handleToggleUserStatus = async (
    id: string,
    isActive: boolean,
    email: string
  ) => {
    const action = isActive ? "deactivate" : "reactivate";
    if (window.confirm(`Are you sure you want to ${action} ${email}?`)) {
      try {
        if (isActive) {
          await deactivateUserMember.mutateAsync(id);
          toast.success("User member deactivated successfully");
          refetch();
        } else {
          await reactivateUserMember.mutateAsync(id);
          toast.success("User member reactivated successfully");
        }
        refetch();
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message || `Failed to ${action} user member`;
        toast.error(errorMessage);
      }
    }
  };

  // Update action buttons to use real functions
  const updatedColumns = columns.map((col) => {
    if ("accessorKey" in col && col.accessorKey === "actions") {
      return {
        ...col,
        cell: ({ row }: any) => {
          const { id, isActive, email } = row.original;

          return (
            <Center className="space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`text-white border-none w-9 h-9 cursor-pointer rounded-md ${
                        isActive
                          ? "bg-red-300 hover:bg-red-500"
                          : "bg-green-300 hover:bg-green-500"
                      }`}
                      onClick={() =>
                        handleToggleUserStatus(id, isActive, email)
                      }
                    >
                      {isActive ? "🔒" : "✅"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="mb-2">
                    <p>{isActive ? "Deactivate" : "Activate"} User</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-[#A50403] text-white border-none w-9 h-9 hover:bg-[#A50403]/80 cursor-pointer rounded-md"
                      onClick={() => handleDeleteUserMember(id, email)}
                      disabled={deleteUserMember.isPending}
                    >
                      <FaRegTrashAlt className="text-white size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="mb-2">
                    <p>Delete User</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Center>
          );
        },
      };
    }
    return col;
  });

  if (isLoading) {
    return (
      <Center className="h-64">
        <Box className="text-lg">Loading user members...</Box>
      </Center>
    );
  }

  if (error) {
    return (
      <Center className="h-64">
        <Box className="text-lg text-red-600">
          Error loading user members:{" "}
          {error?.response?.data?.message || "Unknown error"}
        </Box>
      </Center>
    );
  }

  return (
    <Box className="space-y-4">
      {/* User Members Table */}
      <ReusableTable
        data={userMembers}
        columns={updatedColumns}
        // searchInput={false}
        enablePaymentLinksCalender={false}
        onRowClick={(row) => console.log("Row clicked:", row.original)}
      />
    </Box>
  );
};
