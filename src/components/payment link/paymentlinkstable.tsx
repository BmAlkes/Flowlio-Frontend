import { ColumnDef } from "@tanstack/react-table";
import { Center } from "@/components/ui/center";
import { Box } from "../ui/box";
import { ReusableTable } from "../reusable/reusabletable";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Flex } from "../ui/flex";
import { Copy, Trash2 } from "lucide-react";
import {
  useFetchPaymentLinks,
  PaymentLink,
} from "@/hooks/usefetchpaymentlinks";
import { useDeletePaymentLink } from "@/hooks/usedeletepaymentlink";
import { toast } from "sonner";

// Use PaymentLink type from the hook
export type Data = PaymentLink;

export const PaymentLinksTable = () => {
  const { data: paymentLinksData, isLoading, error } = useFetchPaymentLinks();
  const deletePaymentLinkMutation = useDeletePaymentLink();

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
          <Box className="text-center text-black">ID</Box>
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
      header: () => <Box className="text-black p-1">Client Name</Box>,
      cell: ({ row }) => (
        <Box className="capitalize p-1 w-24 max-sm:w-full">
          {row.original.clientname.length > 15
            ? row.original.clientname.slice(0, 15) + "..."
            : row.original.clientname}
        </Box>
      ),
    },
    {
      accessorKey: "project",
      header: () => <Box className="text-black text-start">Project</Box>,
      cell: ({ row }) => (
        <Box className="captialize text-start">{row.original.project}</Box>
      ),
    },

    {
      accessorKey: "description",
      header: () => <Box className="text-start text-black">Description</Box>,
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
      header: () => <Box className="text-center text-black">Amount</Box>,
      cell: ({ row }) => (
        <Box className="text-center font-semibold text-green-600">
          ${parseFloat(row.original.amount).toFixed(2)}
        </Box>
      ),
    },

    {
      accessorKey: "actions",
      header: () => <Box className="text-center text-black">Actions</Box>,
      cell: ({ row }) => {
        const handleCopyLink = async () => {
          try {
            await navigator.clipboard.writeText(row.original.paymentLink);
            toast.success("Payment link copied to clipboard!");
          } catch (error) {
            console.error("Failed to copy link:", error);
            toast.error("Failed to copy payment link");
          }
        };

        const handleDelete = () => {
          if (
            window.confirm("Are you sure you want to delete this payment link?")
          ) {
            deletePaymentLinkMutation.mutate(row.original.id);
          }
        };

        return (
          <Center className="space-x-2">
            <Button
              onClick={handleCopyLink}
              className="bg-[#e9eefd] border-none text-black hover:bg-[#e9eefd] cursor-pointer rounded-full border-2 border-blue-500"
            >
              <Copy className="w-4 h-4 mr-1" />
              Copy Link
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-red-50 border-none text-red-600 hover:bg-red-100 cursor-pointer rounded-full border-2 border-red-500"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </Center>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <Box className="flex justify-center items-center p-8">
        <Box className="text-gray-500">Loading payment links...</Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="flex justify-center items-center p-8">
        <Box className="text-red-500">Error loading payment links</Box>
      </Box>
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
    </>
  );
};
