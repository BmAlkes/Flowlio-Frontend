import i18n from "@/configs/i18n.config";
import { useTranslation } from "react-i18next";
import { formatDateValue, formatMoney } from "@/lib/locale-format";
import { isOverdue } from "@/components/client-detail/client-detail.utils";
import { ColumnDef } from "@tanstack/react-table";
import { Center } from "@/components/ui/center";
import { Box } from "../ui/box";
import { ReusableTable } from "../reusable/reusabletable";
import { Checkbox } from "../ui/checkbox";
import { Flex } from "../ui/flex";
import { FileText, Download, Trash2, CircleCheck, RotateCcw, Clock } from "lucide-react";
import { useFetchInvoices, Invoice } from "@/hooks/usefetchinvoices";
import { useDeleteInvoice } from "@/hooks/usedeleteinvoice";
import { useGenerateSingleInvoicePDF } from "@/hooks/usegeneratesingleinvoicepdf";
import { useUpdateInvoiceStatus } from "@/hooks/useupdateinvoicestatus";
import { useCallback, useState } from "react";
import { InvoiceTimeDetails } from "./InvoiceTimeDetails";
import { toast } from "sonner";
import { TableSkeleton, ErrorState } from "@/components/skeletons";
import { cn } from "@/lib/utils";

const AVATAR_COLORS = [
  "bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-amber-500",
  "bg-rose-500", "bg-cyan-500", "bg-indigo-500", "bg-pink-500",
];

export function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function getInitials(name: string) {
  return (name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-green-100 text-green-700 dark:bg-green-500/25 dark:text-green-300",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/25 dark:text-amber-300",
  overdue: "bg-rose-100 text-rose-700 dark:bg-rose-500/25 dark:text-rose-300",
  draft: "bg-muted text-muted-foreground",
};

export function getStatusDisplay(invoice: Invoice) {
  const status = invoice.status.toLowerCase();
  if (status === "paid") return { label: "Paid", style: STATUS_STYLES.paid };
  if (status === "draft") return { label: "Draft", style: STATUS_STYLES.draft };
  if (isOverdue(invoice.dueDate))
    return { label: "Overdue", style: STATUS_STYLES.overdue };
  return { label: "Pending", style: STATUS_STYLES.pending };
}

// Actions component to properly use hooks
const InvoiceActions: React.FC<{ invoice: Invoice }> = ({ invoice }) => {
  const { t } = useTranslation();
  const [showTime, setShowTime] = useState(false);
  const deleteInvoiceMutation = useDeleteInvoice();
  const updateStatusMutation = useUpdateInvoiceStatus();
  const { generateSingleInvoicePDF } = useGenerateSingleInvoicePDF();

  const handleDelete = () => {
    if (confirm(t("core.deleteInvoice"))) {
      deleteInvoiceMutation.mutate(invoice.id);
    }
  };

  const handleUpdateStatus = (status: string) => {
    updateStatusMutation.mutate(
      { id: invoice.id, status },
      {
        onSuccess: () => toast.success(t("core.statusUpdated")),
        onError: () => toast.error(t("core.statusError")),
      }
    );
  };

  const handleDownloadPDF = () => {
    // Generate a proper single-invoice document, not the bulk export report
    generateSingleInvoicePDF(invoice);
  };

  const isPaid = invoice.status.toLowerCase() === "paid";

  return (
    <Center className="gap-1.5">
      {invoice.hasTrackedTime && <button type="button" onClick={() => setShowTime(true)} title={t("core.trackedHours")} aria-label={t("core.trackedHours")} className="h-8 w-8 flex items-center justify-center rounded-full bg-[#1797ba]/10 text-[#1797ba] hover:bg-[#1797ba]/20"><Clock className="size-4" /></button>}
      {showTime && <InvoiceTimeDetails invoiceId={invoice.id} invoiceNumber={invoice.invoiceNumber} onClose={() => setShowTime(false)} />}
      <button
        onClick={handleDownloadPDF}
        title={invoice.pdfUrl ? t("core.downloadPdf") : t("core.generatePdf")} aria-label={invoice.pdfUrl ? t("core.downloadPdf") : t("core.generatePdf")}
        className="h-8 w-8 flex items-center justify-center rounded-full bg-[#1797b9]/10 text-[#1797b9] hover:bg-[#1797b9]/20 transition-colors cursor-pointer"
      >
        {invoice.pdfUrl ? <Download className="size-4" /> : <FileText className="size-4" />}
      </button>

      <button
        onClick={() => handleUpdateStatus(isPaid ? "draft" : "paid")}
        disabled={updateStatusMutation.isPending}
        title={isPaid ? t("core.markDraft") : t("core.markPaid")} aria-label={isPaid ? t("core.markDraft") : t("core.markPaid")}
        className={cn(
          "h-8 w-8 flex items-center justify-center rounded-full transition-colors cursor-pointer",
          isPaid
            ? "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-500/20 dark:text-amber-300"
            : "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-500/20 dark:text-green-300",
        )}
      >
        {isPaid ? <RotateCcw className="size-4" /> : <CircleCheck className="size-4" />}
      </button>

      <button
        onClick={handleDelete}
        disabled={deleteInvoiceMutation.isPending}
        title={t("common.delete")} aria-label={t("common.delete")}
        className="h-8 w-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/15 dark:text-red-400 transition-colors cursor-pointer"
      >
        <Trash2 className="size-4" />
      </button>
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
          aria-label={i18n.t("core.selectAll")}
        />
        <Box className="text-center text-foreground">{i18n.t("invoices.invoiceNum")}</Box>
      </Flex>
    ),
    cell: ({ row }) => (
      <Flex className="py-3 px-3 space-x-2">
        <Checkbox
          className="bg-[#D9D9D9] border-none cursor-pointer"
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={i18n.t("core.selectRow")}
        />
        <Box className="text-center">{row.original.invoiceNumber}</Box>
      </Flex>
    ),
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: "clientname",
    header: () => <Box className="text-foreground">{i18n.t("invoices.clientName")}</Box>,
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
          <Box className="capitalize font-medium text-foreground">{name}</Box>
        </Flex>
      );
    },
  },
  {
    accessorKey: "amount",
    header: () => <Box className="text-center text-foreground">{i18n.t("invoices.amount")}</Box>,
    cell: ({ row }) => {
      return <Box className="text-center">{formatMoney(row.original.amount, i18n.language)}</Box>;
    },
  },
  {
    accessorKey: "dueDate",
    header: () => <Box className="text-foreground text-center">{i18n.t("invoices.dueDate")}</Box>,
    cell: ({ row }) => (
      <Box className="captialize text-center">
        {row.original.dueDate
          ? formatDateValue(row.original.dueDate, i18n.language, Intl.DateTimeFormat().resolvedOptions().timeZone)
          : i18n.t("core.notDue")}
      </Box>
    ),
  },

  {
    accessorKey: "status",
    header: () => <Box className="text-center text-foreground">{i18n.t("invoices.status")}</Box>,
    cell: ({ row }) => {
      const { label, style } = getStatusDisplay(row.original);
      return (
        <Center>
          <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", style)}>
            {i18n.t("core." + label.toLowerCase())}
          </span>
        </Center>
      );
    },
  },

  {
    accessorKey: "actions",
    header: () => <Box className="text-center text-foreground">{i18n.t("common.actions")}</Box>,
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
  const { t } = useTranslation();
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
        title={t("core.invoiceError")}
        message={error.message}
      />
    );
  }

  const data = invoicesData?.data || [];

  return (
    <div>
    <p className="mb-3 text-xs text-muted-foreground">{t("core.currencyUnknown")} &middot; {t("core.timeZone", { zone: Intl.DateTimeFormat().resolvedOptions().timeZone })}</p>
    <ReusableTable
      data={data}
      columns={columns}
      enablePaymentLinksCalender={false}
      searchClassName="rounded-full"
      filterClassName="rounded-full"
      onRowClick={(row) => console.log("Row clicked:", row.original)}
      onTableStateChange={handleTableStateChange}
    />
    </div>
  );
};
