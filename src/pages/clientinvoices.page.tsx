import { Box } from "@/components/ui/box";
import { ReusableTable } from "@/components/reusable/reusabletable";
import {
  useFetchClientInvoices,
  type ClientInvoice,
} from "@/hooks/useFetchClientInvoices";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { useGenerateInvoicePDF } from "@/hooks/usegenerateinvoicepdf";
import { useUser } from "@/providers/user.provider";

import { PageWrapper } from "@/components/common/pagewrapper";
import { Stack } from "@/components/ui/stack";
import { useTranslation } from "react-i18next";

const ClientInvoicesPage = () => {
  const { t } = useTranslation();
  const { data: userData } = useUser();
  const clientId = userData?.user?.clientId;
  const organizationId = userData?.user?.organizationId;
  const { generatePDF } = useGenerateInvoicePDF();

  const { data: invoicesResponse, isLoading } = useFetchClientInvoices(
    clientId || undefined,
    organizationId || undefined,
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "draft":
        return "bg-muted text-gray-800 border-border";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-muted text-gray-800 border-border";
    }
  };

  const invoices = invoicesResponse?.data?.invoices || [];

  const columns: ColumnDef<ClientInvoice>[] = [
    {
      accessorKey: "invoiceNumber",
      header: t("invoices.invoiceNum"),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.invoiceNumber}</span>
      ),
    },
    {
      accessorKey: "clientname",
      header: t("invoices.clientName"),
      cell: ({ row }) => <span>{row.original.clientname}</span>,
    },
    {
      accessorKey: "amount",
      header: t("invoices.amount"),
      cell: ({ row }) => (
        <span className="font-semibold">${row.original.amount}</span>
      ),
    },
    {
      accessorKey: "status",
      header: t("invoices.status"),
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={getStatusColor(row.original.status)}
        >
          {row.original.status.toUpperCase()}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: t("invoices.date"),
      cell: ({ row }) =>
        row.original.createdAt
          ? format(new Date(row.original.createdAt), "MMM dd, yyyy")
          : "N/A",
    },
    {
      accessorKey: "dueDate",
      header: t("invoices.dueDate"),
      cell: ({ row }) =>
        row.original.dueDate
          ? format(new Date(row.original.dueDate), "MMM dd, yyyy")
          : "N/A",
    },
    {
      id: "actions",
      header: t("common.actions"),
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              generatePDF({ invoices: [row.original], exportType: "selected" })
            }
            className="hover:bg-blue-50 text-blue-600"
          >
            <Download className="h-4 w-4 mr-1" />
            {t("common.download")}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageWrapper className="mt-6">
      <Stack className="gap-1 p-6 mb-6">
        <h1 className="text-2xl font-medium text-foreground">{t("invoices.title")}</h1>
        <p className="text-muted-foreground">
          {t("invoices.desc")}
        </p>
      </Stack>
      {isLoading ? (
        <Box className="flex justify-center p-10">Loading invoices...</Box>
      ) : invoices?.length === 0 ? (
        <Box className="flex flex-col items-center justify-center p-20 bg-card rounded-xl border border-border shadow-sm">
          <FileText className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-muted-foreground font-medium">No invoices found</p>
          <p className="text-muted-foreground text-sm">
            When an invoice is generated for you, it will appear here.
          </p>
        </Box>
      ) : (
        <Box className=" rounded-xl   border border-border overflow-hidden">
          <ReusableTable
            data={invoices}
            columns={columns}
            searchClassName="rounded-full"
            filterClassName="rounded-full"
          />
        </Box>
      )}
    </PageWrapper>
  );
};

export default ClientInvoicesPage;
