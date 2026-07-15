import { ColumnDef } from "@tanstack/react-table";
import { Center } from "@/components/ui/center";
import { Box } from "../ui/box";
import { ReusableTable } from "../reusable/reusabletable";
import { Checkbox } from "../ui/checkbox";
import { Flex } from "../ui/flex";
import { Copy, Trash2, CircleCheck, Pencil } from "lucide-react";
import {
  useFetchPaymentLinks,
  PaymentLink,
} from "@/hooks/usefetchpaymentlinks";
import { useDeletePaymentLink } from "@/hooks/usedeletepaymentlink";
import { useUpdatePaymentLinkStatus } from "@/hooks/useupdatepaymentlinkstatus";
import { useGeneralModalDisclosure } from "../common/generalmodal";
import { PaymentLinkFormModal } from "./paymentlinkformmodal";
import { useState } from "react";
import { toast } from "sonner";
import { TableSkeleton, ErrorState } from "../skeletons";
import { cn } from "@/lib/utils";

const AVATAR_COLORS = [
  "bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-amber-500",
  "bg-rose-500", "bg-cyan-500", "bg-indigo-500", "bg-pink-500",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string) {
  return (name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Use PaymentLink type from the hook
export type Data = PaymentLink;

export const PaymentLinksTable = () => {
  const { data: paymentLinksData, isLoading, isFetching, error, refetch } = useFetchPaymentLinks();
  const deletePaymentLinkMutation = useDeletePaymentLink();
  const updateStatusMutation = useUpdatePaymentLinkStatus();
  const editModalProps = useGeneralModalDisclosure();
  const [editingLink, setEditingLink] = useState<PaymentLink | null>(null);

  const loading = isLoading || isFetching;

  const columns: ColumnDef<Data>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Flex className="py-2 px-2">
          <Checkbox
            className="bg-[#D9D9D9] border-none cursor-pointer"
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
          <Box className="text-center text-foreground">ID</Box>
        </Flex>
      ),
      cell: ({ row }) => (
        <Flex className="py-2 px-2">
          <Checkbox
            className="bg-[#D9D9D9] border-none cursor-pointer"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
          <Box className="text-center">{row.index + 1234}</Box>
        </Flex>
      ),
      enableSorting: false,
      enableHiding: false,
    },

    {
      accessorKey: "clientname",
      header: () => <Box className="text-foreground p-1">Client Name</Box>,
      cell: ({ row }) => {
        const name = row.original.clientname;
        return (
          <Flex className="items-center gap-2.5 p-1">
            <div
              className={cn(
                "size-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold",
                getAvatarColor(name),
              )}
            >
              {getInitials(name)}
            </div>
            <Box className="capitalize font-medium text-foreground">
              {name.length > 15 ? name.slice(0, 15) + "..." : name}
            </Box>
          </Flex>
        );
      },
    },
    {
      accessorKey: "project",
      header: () => <Box className="text-foreground text-start">Project</Box>,
      cell: ({ row }) => (
        <Box className="captialize text-start">{row.original.project}</Box>
      ),
    },

    {
      accessorKey: "description",
      header: () => <Box className="text-start text-foreground">Description</Box>,
      cell: ({ row }) => {
        return (
          <Box className="text-start">
            {row.original.description.length > 35
              ? row.original.description.slice(0, 35) + "..."
              : row.original.description}
          </Box>
        );
      },
    },

    {
      accessorKey: "amount",
      header: () => <Box className="text-center text-foreground">Amount</Box>,
      cell: ({ row }) => (
        <Box className="text-center font-semibold text-green-600">
          ${parseFloat(row.original.amount).toFixed(2)}
        </Box>
      ),
    },

    {
      accessorKey: "status",
      header: () => <Box className="text-center text-foreground">Status</Box>,
      cell: ({ row }) => {
        const isPaid = row.original.status === "paid";
        return (
          <Center>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                isPaid
                  ? "bg-green-100 text-green-700 dark:bg-green-500/25 dark:text-green-300"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-500/25 dark:text-amber-300"
              }`}
            >
              {isPaid ? "Paid" : "Unpaid"}
            </span>
          </Center>
        );
      },
    },

    {
      accessorKey: "actions",
      header: () => <Box className="text-center text-foreground">Actions</Box>,
      cell: ({ row }) => {
        const isPaid = row.original.status === "paid";

        const handleCopyLink = async () => {
          try {
            await navigator.clipboard.writeText(row.original.paymentLink);
            toast.success("Payment link copied to clipboard!");
          } catch (error) {
            console.error("Failed to copy link:", error);
            toast.error("Failed to copy payment link");
          }
        };

        const handleToggleStatus = () => {
          updateStatusMutation.mutate(
            { id: row.original.id, status: isPaid ? "unpaid" : "paid" },
            { onSuccess: () => toast.success(isPaid ? "Marked as unpaid" : "Marked as paid") },
          );
        };

        const handleDelete = () => {
          if (
            window.confirm("Are you sure you want to delete this payment link?")
          ) {
            deletePaymentLinkMutation.mutate(row.original.id);
          }
        };

        const handleEdit = () => {
          setEditingLink(row.original);
          editModalProps.onOpenChange(true);
        };

        return (
          <Center className="gap-1.5">
            <button
              onClick={handleEdit}
              title="Edit"
              className="h-8 w-8 flex items-center justify-center rounded-full bg-muted text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopyLink}
              title="Copy Link"
              className="h-8 w-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-300 transition-colors cursor-pointer"
            >
              <Copy className="w-4 h-4" />
            </button>
            {!isPaid && (
              <button
                onClick={handleToggleStatus}
                disabled={updateStatusMutation.isPending}
                title="Mark as Paid"
                className="h-8 w-8 flex items-center justify-center rounded-full bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-500/20 dark:text-green-300 transition-colors cursor-pointer"
              >
                <CircleCheck className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleDelete}
              title="Delete"
              className="h-8 w-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/15 dark:text-red-400 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </Center>
        );
      },
    },
  ];

  if (loading && !paymentLinksData) {
    return (
      <Box className="mt-4">
        <TableSkeleton rows={5} />
      </Box>
    );
  }
 
  if (error) {
    return (
      <ErrorState
        title="Failed to load payment links"
        message="Could not fetch the payment link data. Please try again later."
        onRetry={refetch}
      />
    );
  }

  const data = paymentLinksData?.data || [];

  return (
    <>
      <ReusableTable
        data={data}
        columns={columns}
        // searchInput={false}
        enablePaymentLinksCalender={false}
        searchClassName="rounded-full"
        filterClassName="rounded-full"
        onRowClick={(row) => console.log("Row clicked:", row.original)}
      />
      <PaymentLinkFormModal modalProps={editModalProps} existing={editingLink} />
    </>
  );
};
