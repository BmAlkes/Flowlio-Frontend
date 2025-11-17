import { ColumnDef } from "@tanstack/react-table";
import { Center } from "@/components/ui/center";
import { Box } from "@/components/ui/box";
import { ReusableTable } from "@/components/reusable/reusabletable";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { FaRegTrashAlt } from "react-icons/fa";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFetchSubAdmins } from "@/hooks/usefetchsubadmins";
import { useEffect } from "react";
import { toast } from "sonner";
import { useDeleteSubAdmin } from "@/hooks/usedeletesubadmin";
import { useUpdateSubAdminPermission } from "@/hooks/useupdatesubadminpermission";
import { Flex } from "@/components/ui/flex";

export type SubAdminData = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  permission: string;
  createdAt: string;
  image?: string | null;
};

export const SubAdminTable = () => {
  const { fetchNextPage, hasNextPage, isLoading, error, data, refetch } =
    useFetchSubAdmins();

  const { mutate: deleteSubAdmin } = useDeleteSubAdmin();
  const { mutate: updateSubAdminPermission, isPending: isUpdatingPermission } =
    useUpdateSubAdminPermission();

  useEffect(() => {
    if (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch sub admins"
      );
    }
  }, [error]);

  const transformedData: SubAdminData[] =
    data?.pages.flatMap(
      (page) =>
        page.data?.map((item: any) => ({
          id: item.id,
          firstName: item.firstName || "",
          lastName: item.lastName || "",
          email: item.email || "",
          contactNumber: item.contactNumber || "",
          permission: item.permission || "Active",
          createdAt: item.createdAt || new Date().toISOString(),
          image: item.logo || item.image || item.user?.image || null,
        })) || []
    ) || [];

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this sub admin?")) {
      deleteSubAdmin(
        { id },
        {
          onSuccess: () => {
            toast.success("Sub Admin deleted successfully");
            // Refetch the subadmin data after successful deletion
            refetch();
          },
          onError: (error) => {
            toast.error(
              error.response?.data?.message || "Failed to delete sub admin"
            );
          },
        }
      );
    }
  };

  const handlePermissionChange = (
    id: string,
    newPermission: "Active" | "Deactivated"
  ) => {
    updateSubAdminPermission(
      { id, permission: newPermission },
      {
        onSuccess: () => {
          toast.success("Sub Admin permission updated successfully");
          refetch();
        },
        onError: (error) => {
          toast.error(
            error.response?.data?.message ||
              "Failed to update sub admin permission"
          );
          console.error("Failed to update permission:", error);
        },
      }
    );
  };

  // Create columns with access to handleDelete function
  const tableColumns: ColumnDef<SubAdminData>[] = [
    {
      accessorKey: "logo",
      header: () => <Box className="text-black font-semibold p-3">Logo</Box>,
      cell: ({ row }) => (
        <Box className="p-3">
          {row.original.image ? (
            <img
              src={row.original.image}
              alt="Sub Admin"
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300">
              <span className="text-[8px] text-gray-500 text-center px-1 leading-tight">
                Null
              </span>
            </div>
          )}
        </Box>
      ),
    },
    {
      accessorKey: "name",
      header: () => <Box className="text-black font-semibold p-3">Name</Box>,
      cell: ({ row }) => (
        <Box className="p-3">
          <div className="font-medium capitalize">
            {row.original.firstName} {row.original.lastName}
          </div>
        </Box>
      ),
    },
    {
      accessorKey: "email",
      header: () => (
        <Box className="text-black font-semibold text-center">Email</Box>
      ),
      cell: ({ row }) => (
        <Box className="text-center">{row.original.email || "N/A"}</Box>
      ),
    },
    {
      accessorKey: "contactNumber",
      header: () => (
        <Box className="text-black font-semibold text-center">Contact</Box>
      ),
      cell: ({ row }) => (
        <Box className="text-center">{row.original.contactNumber || "N/A"}</Box>
      ),
    },
    {
      accessorKey: "permission",
      header: () => (
        <Box className="text-black font-semibold text-center">Permission</Box>
      ),
      cell: ({ row }) => {
        return (
          <Center>
            <Select
              defaultValue={row.original.permission}
              onValueChange={(value: "Active" | "Deactivated") =>
                handlePermissionChange(row.original.id, value)
              }
              disabled={isUpdatingPermission}
            >
              <SelectTrigger className="border rounded-md p-2 text-center bg-white w-32">
                <SelectValue
                  placeholder="Select"
                  defaultValue={row.original.permission}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Deactivated">Deactivated</SelectItem>
              </SelectContent>
            </Select>
          </Center>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: () => (
        <Box className="text-black font-semibold text-center">Created</Box>
      ),
      cell: ({ row }) => (
        <Box className="text-center text-sm text-gray-600">
          {new Date(row.original.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Box>
      ),
    },
    {
      accessorKey: "actions",
      header: () => (
        <Box className="text-center text-black font-semibold">Actions</Box>
      ),
      cell: ({ row }) => {
        return (
          <Center className="space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => handleDelete(row.original.id)}
                    variant="outline"
                    className="bg-[#A50403] border-none w-30 h-10 hover:bg-[#A50403]/80 cursor-pointer rounded-md text-white hover:text-white"
                  >
                    <FaRegTrashAlt className="text-white fill-white size-4 " />
                    Delete
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete Sub Admin</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Center>
        );
      },
    },
  ];

  return (
    <>
      <ReusableTable
        data={transformedData}
        columns={tableColumns}
        enableGlobalFilter={true}
        enablePaymentLinksCalender={false}
      />

      {hasNextPage && (
        <Flex className="justify-center mt-4">
          <Button
            onClick={() => fetchNextPage()}
            variant="outline"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Load More"}
          </Button>
        </Flex>
      )}
    </>
  );
};
