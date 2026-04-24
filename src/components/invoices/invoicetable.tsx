import { ColumnDef } from "@tanstack/react-table";
import { Center } from "@/components/ui/center";
import { Box } from "../ui/box";
import { ReusableTable } from "../reusable/reusabletable";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Flex } from "../ui/flex";
import { CircleCheck, FileText, Download, Trash2 } from "lucide-react";
import { useFetchInvoices, Invoice } from "@/hooks/usefetchinvoices";
import { useDeleteInvoice } from "@/hooks/usedeleteinvoice";
import { useGenerateInvoicePDF } from "@/hooks/usegenerateinvoicepdf";
import { useUpdateInvoiceStatus } from "@/hooks/useupdateinvoicestatus";
import { useCallback } from "react";
import { toast } from "sonner";
import { TableSkeleton, ErrorState } from "@/components/skeletons";

// Actions component to properly use hooks
const InvoiceActions: React.FC<{ invoice: Invoice }> = ({ invoice }) => {
  const deleteInvoiceMutation = useDeleteInvoice();
  const updateStatusMutation = useUpdateInvoiceStatus();
  const { generatePDF } = useGenerateInvoicePDF();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      deleteInvoiceMutation.mutate(invoice.id);
    }
  };

  const handleUpdateStatus = (status: string) => {
    updateStatusMutation.mutate(
      { id: invoice.id, status },
      {
        onSuccess: () => toast.success(`Invoice marked as ${status}`),
        onError: () => toast.error(`Failed to update invoice status`),
      }
    );
  };

  const handleDownloadPDF = () => {
    // Generate new PDF from frontend to ensure data accuracy
    generatePDF({ invoices: [invoice], exportType: "selected" });
  };

  return (
    <Center className="space-x-2">
      <Button
        onClick={handleDownloadPDF}
        className="bg-[#1797b9] border-none hover:bg-[#1797b9]/80 cursor-pointer rounded-full space-x-2 text-white"
        disabled={false}
      >
        {invoice.pdfUrl ? (
          <Download className="size-4 text-white" />
        ) : (
          <FileText className="size-4 text-white" />
        )}
        {invoice.pdfUrl ? "Download" : "Generate PDF"}
      </Button>

      {invoice.status.toLowerCase() !== "paid" && (
        <Button
          onClick={() => handleUpdateStatus("paid")}
          className="bg-green-500 border-none hover:bg-green-600 cursor-pointer rounded-full space-x-2 text-white"
          disabled={updateStatusMutation.isPending}
        >
          <CircleCheck className="size-4" />
          Mark as Paid
        </Button>
      )}

      {invoice.status.toLowerCase() === "paid" && (
        <Button
          onClick={() => handleUpdateStatus("draft")}
          className="bg-yellow-500 border-none hover:bg-yellow-600 cursor-pointer rounded-full space-x-2 text-white"
          disabled={updateStatusMutation.isPending}
        >
          Mark as Draft
        </Button>
      )}

      <Button
        onClick={handleDelete}
        variant="outline"
        className="border-red-500 text-red-500 hover:bg-red-50 cursor-pointer rounded-full space-x-2"
        disabled={deleteInvoiceMutation.isPending}
      >
        <Trash2 className="size-4" />
        Delete
      </Button>
    </Center>
  );
};

export type Data = Invoice;

export const columns: ColumnDef<Data>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Flex className="py-3 px-3 space-x-2">
        <Checkbox
          className="bg-[#D9D9D9] border-none cursor-pointer"
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
        <Box className="text-center text-foreground">Invoice Number</Box>
      </Flex>
    ),
    cell: ({ row }) => (
      <Flex className="py-3 px-3 space-x-2">
        <Checkbox
          className="bg-[#D9D9D9] border-none cursor-pointer"
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
        <Box className="text-center">{row.original.invoiceNumber}</Box>
      </Flex>
    ),
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: "clientname",
    header: () => <Box className="text-foreground">Client Name</Box>,
    cell: ({ row }) => (
      <Box className="capitalize p-1">{row.original.clientname}</Box>
    ),
  },
  {
    accessorKey: "amount",
    header: () => <Box className="text-center text-foreground">Amount</Box>,
    cell: ({ row }) => {
      return <Box className="text-center">$ {row.original.amount}</Box>;
    },
  },
  {
    accessorKey: "dueDate",
    header: () => <Box className="text-foreground text-center">Due Date</Box>,
    cell: ({ row }) => (
      <Box className="captialize text-center">
        {row.original.dueDate
          ? new Date(row.original.dueDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "Not due"}
      </Box>
    ),
  },

  {
    accessorKey: "status",
    header: () => <Box className="text-center text-foreground">Status</Box>,
    cell: ({ row }) => {
      const status = row.original.status.toLowerCase();
      const isPaid = status === "paid";

      return (
        <Center className="text-center space-x-2">
          <CircleCheck
            className={`size-5 ${isPaid ? "text-green-500" : "text-muted-foreground"}`}
          />
          <Box className="text-center text-[15px] capitalize">
            {row.original.status}
          </Box>
        </Center>
      );
    },
  },

  {
    accessorKey: "actions",
    header: () => <Box className="text-center text-foreground">Actions</Box>,
    cell: ({ row }) => <InvoiceActions invoice={row.original} />,
  },
];

interface InvoiceTableProps {
  onTableStateChange?: (state: {
    selectedRows: Invoice[];
    currentPageRows: Invoice[];
    selectedRowIds: string[];
  }) => void;
}

export const InvoiceTable = ({ onTableStateChange }: InvoiceTableProps) => {
  const orgInvoices = useFetchInvoices();
  const invoicesData = orgInvoices.data;
  const isLoading = orgInvoices.isLoading;
  const isFetching = orgInvoices.isFetching;
  const error = orgInvoices.error;
  const loading = isLoading || isFetching;

  // Memoize the callback to prevent infinite loops
  const handleTableStateChange = useCallback(
    (state: { rowSelection: Record<string, boolean> }) => {
      const data = invoicesData?.data || [];
      const selectedRows = data.filter((_, index) => state.rowSelection[index]);
      const selectedRowIds = selectedRows.map((row) => row.id);

      const newTableState = {
        selectedRows,
        currentPageRows: data, // For now, we'll use all data as current page
        selectedRowIds,
      };

      // Call the parent callback with the new state
      if (onTableStateChange) {
        onTableStateChange(newTableState);
      }
    },
    [invoicesData?.data, onTableStateChange],
  );

  if (loading) {
    return <TableSkeleton rows={6} columns={5} withActions />;
  }

  if (error) {
    return (
      <ErrorState
        title="Error loading invoices"
        message={error.message}
      />
    );
  }

  const data = invoicesData?.data || [];

  return (
    <ReusableTable
      data={data}
      columns={columns}
      enablePaymentLinksCalender={false}
      searchClassName="rounded-full"
      filterClassName="rounded-full"
      onRowClick={(row) => console.log("Row clicked:", row.original)}
      onTableStateChange={handleTableStateChange}
    />
  );
};
