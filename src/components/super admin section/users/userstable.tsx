import { ColumnDef } from "@tanstack/react-table";
import { Center } from "@/components/ui/center";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { ReusableTable } from "@/components/reusable/reusabletable";
import { Button } from "@/components/ui/button";
import { FaRegTrashAlt } from "react-icons/fa";
import {
  useFetchAllUsers,
  UserWithOrganizations,
} from "@/hooks/useFetchAllUsers";
import { useState } from "react";
import { DeleteUserModal } from "./DeleteUserModal";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { TableSkeleton, ErrorState } from "@/components/skeletons";

export const UsersTable = () => {
  const { t } = useTranslation();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const [page, setPage] = useState(1);
  const {
    data: usersResponse,
    isLoading,
    isFetching,
    error,
  } = useFetchAllUsers({ page, limit: 20 });

  const loading = isLoading || isFetching;

  const users = usersResponse?.data?.users || [];
  const pagination = usersResponse?.data?.pagination;

  const handleDeleteClick = (user: UserWithOrganizations) => {
    setSelectedUser({
      id: user.id,
      name: user.name,
      email: user.email,
    });
    setDeleteModalOpen(true);
  };

  const handleDeleteModalClose = () => {
    setDeleteModalOpen(false);
    setSelectedUser(null);
  };

  const getColumns = (): ColumnDef<UserWithOrganizations>[] => [
    {
      id: "select",
      header: () => <Box className="text-center text-foreground">ID</Box>,
      cell: ({ row }) => (
        <Box className="text-center">#{row.original.id.slice(0, 8)}</Box>
      ),
      size: 100,
      enableSorting: false,
    },
    {
      accessorKey: "name",
      header: () => <Box className="text-foreground">{t("superadmin.users.table.name", "Name")}</Box>,
      cell: ({ row }) => (
        <Flex className="items-center gap-2">
          {row.original.image ? (
            <img
              src={row.original.image}
              alt={row.original.name}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <Box className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
              {row.original.name?.charAt(0).toUpperCase() || "U"}
            </Box>
          )}
          <Box className="font-medium text-foreground">{row.original.name}</Box>
        </Flex>
      ),
      size: 200,
    },
    {
      accessorKey: "email",
      header: () => <Box className="text-foreground">{t("superadmin.users.table.email", "Email")}</Box>,
      cell: ({ row }) => (
        <Box className="text-muted-foreground">{row.original.email}</Box>
      ),
      size: 250,
    },
    {
      accessorKey: "role",
      header: () => <Box className="text-foreground">{t("superadmin.users.table.role", "Role")}</Box>,
      cell: ({ row }) => (
        <Flex className="gap-2 items-center">
          {row.original.isSuperAdmin ? (
            <Badge className="bg-purple-100 text-purple-800">{t("superadminSettings.superAdmin", "Super Admin")}</Badge>
          ) : row.original.subadminId ? (
            <Badge className="bg-blue-100 text-blue-800">{t("superadminSettings.subAdmin", "Sub Admin")}</Badge>
          ) : (
            <Badge className="bg-muted text-gray-800">
              {row.original.role ? t(`userManagement.roles.${row.original.role.toLowerCase()}`, row.original.role) : t("superadminSettings.user", "User")}
            </Badge>
          )}
        </Flex>
      ),
      size: 150,
    },
    {
      accessorKey: "organizations",
      header: () => <Box className="text-foreground">{t("superadmin.users.table.company", "Organizations")}</Box>,
      cell: ({ row }) => (
        <Box className="text-muted-foreground">
          {row.original.organizationCount || 0} {t("appSidebar.companies", "Organizations")}
        </Box>
      ),
      size: 150,
    },
    {
      accessorKey: "emailVerified",
      header: () => <Box className="text-foreground">{t("superadmin.users.table.status", "Status")}</Box>,
      cell: ({ row }) => (
        <Badge
          className={
            row.original.emailVerified
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }
        >
          {row.original.emailVerified ? t("common.verified", "Verified") : t("common.unverified", "Unverified")}
        </Badge>
      ),
      size: 120,
    },
    {
      accessorKey: "createdAt",
      header: () => <Box className="text-foreground">{t("superadmin.users.table.addedOn", "Created At")}</Box>,
      cell: ({ row }) => (
        <Box className="text-muted-foreground text-sm">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </Box>
      ),
      size: 150,
    },
    {
      accessorKey: "actions",
      header: () => <Box className="text-center text-foreground">{t("superadmin.users.table.actions", "Actions")}</Box>,
      cell: ({ row }) => (
        <Center>
          <Button
            onClick={() => handleDeleteClick(row.original)}
            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded"
            disabled={row.original.isSuperAdmin}
          >
            <FaRegTrashAlt className="size-4" />
          </Button>
        </Center>
      ),
      size: 100,
    },
  ];

  if (loading) {
    return (
      <Box className="px-4 py-4">
        <TableSkeleton rows={10} columns={7} withAvatar withActions />
      </Box>
    );
  }

  if (error) {
    return (
      <Center className="py-10">
        <ErrorState
          title={t("common.error")}
          message={t("common.errorDescription", "Error loading users. Please try again.")}
        />
      </Center>
    );
  }

  return (
    <>
      <ReusableTable
        data={users}
        columns={getColumns()}
        enableGlobalFilter={true}
        pagination={
          pagination
            ? {
                pageIndex: pagination.currentPage - 1,
                pageSize: pagination.limit,
                pageCount: pagination.totalPages,
                total: pagination.totalUsers,
                onPageChange: (newPage: number) => setPage(newPage + 1),
              }
            : undefined
        }
      />

      <DeleteUserModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteModalClose}
        user={selectedUser}
      />
    </>
  );
};
