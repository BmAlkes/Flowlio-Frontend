import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Center } from "@/components/ui/center";
import { Box } from "../ui/box";
import { Flex } from "../ui/flex";
import { ReusableTable } from "../reusable/reusabletable";
import { format } from "date-fns";
import { enUS, es, he as heLocale, ptBR } from "date-fns/locale";
import type { Locale } from "date-fns";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { FaRegTrashAlt } from "react-icons/fa";
import { Star } from "lucide-react";
import {
  useDeleteUserMember,
  useDeactivateUserMember,
  useReactivateUserMember,
} from "@/hooks/usedeleteusermember";
import { useUpdateOrganizationManager } from "@/hooks/useUpdateOrganizationManager";
import { useUser } from "@/providers/user.provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { TableSkeleton, ErrorState } from "../skeletons";

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

function getDateLocaleForLanguage(lang: string | undefined): Locale {
  const base = lang?.split("-")[0] || "en";
  const map: Record<string, Locale> = {
    en: enUS,
    es,
    he: heLocale,
    pt: ptBR,
  };
  return map[base] ?? enUS;
}

function translateMemberRole(role: string, t: TFunction) {
  const key = `userManagement.roles.${role.toLowerCase().replace(/\s+/g, "")}`;
  return t(key, { defaultValue: role });
}

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
  const { t, i18n } = useTranslation();
  const dateLocale = getDateLocaleForLanguage(i18n.language);

  const { data: userData } = useUser();
  const isOrganizationOwner = userData?.user?.isOrganizationOwner === true;

  const updateOrgManager = useUpdateOrganizationManager();
  const [orgManagerModal, setOrgManagerModal] = useState<{
    open: boolean;
    type: "promote" | "demote";
    member: { id: string; name: string } | null;
  }>({ open: false, type: "promote", member: null });

  // Delete user member hook
  const deleteUserMember = useDeleteUserMember();
  const deactivateUserMember = useDeactivateUserMember();
  const reactivateUserMember = useReactivateUserMember();

  // Handle delete user member
  const handleDeleteUserMember = async (id: string, email: string) => {
    if (window.confirm(t("userManagement.confirmDelete", { email }))) {
      try {
        await deleteUserMember.mutateAsync(id);
        toast.success(t("userManagement.toastDeleted"));
        refetch();
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message || t("userManagement.toastDeleteFailed");
        toast.error(errorMessage);
      }
    }
  };

  // Handle deactivate/reactivate user member
  const handleToggleUserStatus = async (
    id: string,
    isActive: boolean,
    email: string,
  ) => {
    const confirmed = window.confirm(
      isActive
        ? t("userManagement.confirmDeactivate", { email })
        : t("userManagement.confirmReactivate", { email }),
    );
    if (confirmed) {
      try {
        if (isActive) {
          await deactivateUserMember.mutateAsync(id);
          toast.success(t("userManagement.toastDeactivated"));
          refetch();
        } else {
          await reactivateUserMember.mutateAsync(id);
          toast.success(t("userManagement.toastReactivated"));
        }
        refetch();
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          (isActive
            ? t("userManagement.toastDeactivateFailed")
            : t("userManagement.toastReactivateFailed"));
        toast.error(errorMessage);
      }
    }
  };

  const handleConfirmOrgManager = async () => {
    if (!orgManagerModal.member) return;
    try {
      await updateOrgManager.mutateAsync({
        memberId: orgManagerModal.member.id,
        setAsManager: orgManagerModal.type === "promote",
      });
      toast.success(
        orgManagerModal.type === "promote"
          ? t("userManagement.toastPromoted")
          : t("userManagement.toastDemoted"),
      );
      setOrgManagerModal({ open: false, type: "promote", member: null });
      refetch();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        (orgManagerModal.type === "promote"
          ? t("userManagement.toastPromoteFailed")
          : t("userManagement.toastDemoteFailed"));
      toast.error(msg);
    }
  };

  const columns: ColumnDef<Data>[] = [
    {
      accessorKey: "firstname",
      header: () => <Box className="text-foreground pl-4">{t("table.name")}</Box>,
      cell: ({ row }) => (
        <Flex className="capitalize pl-4 w-30 max-sm:w-full">
          <Avatar className="size-8">
            <AvatarImage
              src={row.original.user?.image || "https://github.com/shadcn.png"}
            />
            <AvatarFallback>
              {row.original.user?.name?.charAt(0) || row.original.firstname.charAt(0)}
              {row.original.user?.name?.split(" ")[1]?.charAt(0) || row.original.lastname.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <Box className="ml-2">
            <Box className="font-medium">
              {row.original.user?.name || `${row.original.firstname} ${row.original.lastname}`}
            </Box>
          </Box>
        </Flex>
      ),
    },
    {
      accessorKey: "email",
      header: () => (
        <Box className="text-foreground text-start w-26 max-lg:w-full font-medium">
          {t("table.email")}
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
      header: () => (
        <Box className="text-foreground text-center">{t("table.company")}</Box>
      ),
      cell: ({ row }) => (
        <Box className="capitalize text-center">{row.original.companyname}</Box>
      ),
    },
    {
      accessorKey: "userrole",
      header: () => (
        <Box className="text-center text-foreground">{t("table.role")}</Box>
      ),
      cell: ({ row }) => (
        <Center className="text-center capitalize">
          {translateMemberRole(row.original.userrole, t)}
        </Center>
      ),
    },
    {
      accessorKey: "createdAt",
      header: () => (
        <Box className="text-center text-foreground">{t("table.addedOn")}</Box>
      ),
      cell: ({ row }) => {
        const createdAt = new Date(row.original.createdAt);
        try {
          return (
            <Box className="text-center">
              {format(createdAt, "PP", { locale: dateLocale })}
            </Box>
          );
        } catch {
          console.error("Invalid date:", createdAt);
          return (
            <Box className="text-center">{t("userManagement.invalidDate")}</Box>
          );
        }
      },
    },
    {
      accessorKey: "status",
      header: () => (
        <Box className="text-center text-foreground">{t("table.status")}</Box>
      ),
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
        const label = isActive
          ? t("userManagement.memberStatus.active")
          : t("userManagement.memberStatus.inactive");

        return (
          <Center>
            <Flex
              className={`rounded-md capitalize w-30 h-10 gap-2 border justify-center items-center ${statusStyles[currentStatus].text}`}
            >
              <Center className="gap-2">
                <Flex
                  className={`w-2 h-2 items-start rounded-full ${statusStyles[currentStatus].dot}`}
                />
                <h1>{label}</h1>
              </Center>
            </Flex>
          </Center>
        );
      },
    },
    {
      accessorKey: "actions",
      header: () => (
        <Box className="text-center text-foreground">{t("common.actions")}</Box>
      ),
      cell: ({ row }) => {
        const { id, isActive, email, firstname, lastname, userrole, user } =
          row.original;
        const displayName = user?.name || `${firstname} ${lastname}`.trim() || email;
        const canPromote = userrole === "viewer";
        const canDemote = userrole === "user";
        const showOrgManagerButton =
          isOrganizationOwner && (canPromote || canDemote);

        return (
          <Center className="space-x-2">
            {showOrgManagerButton && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`border-none w-9 h-9 cursor-pointer rounded-md ${
                        canDemote
                          ? "bg-amber-500 text-white hover:bg-amber-600"
                          : "bg-gray-600 text-white hover:bg-gray-700"
                      }`}
                      onClick={() =>
                        setOrgManagerModal({
                          open: true,
                          type: canPromote ? "promote" : "demote",
                          member: { id, name: displayName },
                        })
                      }
                      disabled={updateOrgManager.isPending}
                    >
                      <Star
                        className={`size-4 ${canDemote ? "fill-current" : ""}`}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="mb-2">
                    <p>
                      {canPromote
                        ? t("userManagement.makeOrgManager")
                        : t("userManagement.removeOrgManager")}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`border-none w-9 h-9 cursor-pointer rounded-md ${
                      isActive
                        ? "bg-red-400 hover:bg-red-500 text-white"
                        : "bg-green-400 hover:bg-green-500 text-white"
                    }`}
                    onClick={() => handleToggleUserStatus(id, isActive, email)}
                  >
                    {isActive ? "🔒" : "✅"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="mb-2">
                  <p>
                    {isActive
                      ? t("userManagement.deactivateUser")
                      : t("userManagement.activateUser")}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-destructive text-destructive-foreground border-none w-9 h-9 hover:bg-destructive/90 cursor-pointer rounded-md"
                    onClick={() => handleDeleteUserMember(id, email)}
                    disabled={deleteUserMember.isPending}
                  >
                    <FaRegTrashAlt className="text-white size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="mb-2">
                  <p>{t("userManagement.deleteUser")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Center>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <Box className="mt-4">
        <TableSkeleton rows={8} />
      </Box>
    );
  }
 
  if (error) {
    return (
      <ErrorState
        title={t("userManagement.errorLoading")}
        message={error?.response?.data?.message || t("userManagement.unknownError")}
        onRetry={refetch}
      />
    );
  }

  return (
    <Box className="space-y-4">
      {/* User Members Table */}
      <ReusableTable
        data={userMembers}
        columns={columns}
        // searchInput={false}
        enablePaymentLinksCalender={false}
        onRowClick={(row) => console.log("Row clicked:", row.original)}
      />

      {/* Organization Manager confirm modal */}
      <Dialog
        open={orgManagerModal.open}
        onOpenChange={(open) =>
          !open &&
          setOrgManagerModal({ open: false, type: "promote", member: null })
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {orgManagerModal.type === "promote"
                ? t("userManagement.modalPromoteTitle")
                : t("userManagement.modalDemoteTitle")}
            </DialogTitle>
            <DialogDescription>
              {orgManagerModal.type === "promote"
                ? t("userManagement.modalPromoteDesc", {
                    name: orgManagerModal.member?.name ?? "",
                  })
                : t("userManagement.modalDemoteDesc", {
                    name: orgManagerModal.member?.name ?? "",
                  })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() =>
                setOrgManagerModal({
                  open: false,
                  type: "promote",
                  member: null,
                })
              }
            >
              {t("userManagement.no")}
            </Button>
            <Button
              onClick={handleConfirmOrgManager}
              disabled={updateOrgManager.isPending}
            >
              {updateOrgManager.isPending ? "..." : t("userManagement.yes")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Box>
  );
};
