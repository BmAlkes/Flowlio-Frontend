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
import { useTranslation } from "react-i18next";
import { TableSkeleton, ErrorState } from "@/components/skeletons";

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
  const { t } = useTranslation();
  const {
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetching,
    error,
    data,
    refetch,
  } = useFetchSubAdmins();

  const loading = isLoading || isFetching;

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
      header: () => <Box className="text-foreground font-semibold p-3">Logo</Box>,
      cell: ({ row }) => (
        <Box className="p-3">
          {row.original.image ? (
            <img
              src={row.original.image}
              alt="Sub Admin"
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border border-border">
              <span className="text-[8px] text-muted-foreground text-center px-1 leading-tight">
                Null
              </span>
            </div>
          )}
        </Box>
      ),
    },
    {
      accessorKey: "name",
      header: () => <Box className="text-foreground font-semibold p-3">{t("superadmin.subAdmins.table.name")}</Box>,
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
        <Box className="text-foreground font-semibold text-center">{t("superadmin.subAdmins.table.email")}</Box>
      ),
      cell: ({ row }) => (
        <Box className="text-center">{row.original.email || t("common.unknown")}</Box>
      ),
    },
    {
      accessorKey: "contactNumber",
      header: () => (
        <Box className="text-foreground font-semibold text-center">{t("settings.phone")}</Box>
      ),
      cell: ({ row }) => (
        <Box className="text-center">{row.original.contactNumber || t("common.notSet")}</Box>
      ),
    },
    {
      accessorKey: "permission",
      header: () => (
        <Box className="text-foreground font-semibold text-center">{t("superadmin.subAdmins.table.type")}</Box>
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
              <SelectTrigger className="border rounded-md p-2 text-center bg-card w-32">
                <SelectValue
                  placeholder="Select"
                  defaultValue={row.original.permission}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">{t("userManagement.memberStatus.active")}</SelectItem>
                <SelectItem value="Deactivated">{t("userManagement.memberStatus.inactive")}</SelectItem>
              </SelectContent>
            </Select>
          </Center>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: () => (
        <Box className="text-foreground font-semibold text-center">{t("superadmin.subAdmins.table.addedOn")}</Box>
      ),
      cell: ({ row }) => (
        <Box className="text-center text-sm text-muted-foreground">
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
        <Box className="text-center text-foreground font-semibold">{t("superadmin.subAdmins.table.actions")}</Box>
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
                    <FaRegTrashAlt className="size-4 text-white" />
                    {t("common.delete")}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("common.delete")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Center>
        );
      },
    },
  ];

  if (loading && transformedData.length === 0) {
    return (
      <Box className="px-4 py-4">
        <TableSkeleton rows={5} columns={7} withAvatar withActions />
      </Box>
    );
  }

  if (error && transformedData.length === 0) {
    return (
      <Center className="py-10">
        <ErrorState
          title={t("common.error")}
          message={error.message || t("common.errorDescription", "Failed to fetch sub admins")}
        />
      </Center>
    );
  }

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
            {isLoading ? t("common.loading") : t("common.next")}
          </Button>
        </Flex>
      )}
    </>
  );
};
