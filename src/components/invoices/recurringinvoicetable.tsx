import { ColumnDef } from "@tanstack/react-table";
import { Center } from "@/components/ui/center";
import { Box } from "../ui/box";
import { ReusableTable } from "../reusable/reusabletable";
import { Button } from "../ui/button";
import { Trash2, Play, Pause, Calendar, Clock } from "lucide-react";
import { useFetchRecurringInvoices, RecurringInvoice } from "@/hooks/usefetchrecurringinvoices";
import { useDeleteRecurringTemplate, useUpdateRecurringTemplate } from "@/hooks/usecreaterecurringinvoice";
import { Badge } from "../ui/badge";

const RecurringActions: React.FC<{ template: RecurringInvoice }> = ({ template }) => {
  const deleteMutation = useDeleteRecurringTemplate();
  const updateMutation = useUpdateRecurringTemplate();

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this recurring template?")) {
      deleteMutation.mutate(template.id);
    }
  };

  const toggleStatus = () => {
    const newStatus = template.status === "active" ? "paused" : "active";
    updateMutation.mutate({ id: template.id, status: newStatus });
  };

  return (
    <Center className="space-x-2">
      <Button
        onClick={toggleStatus}
        variant="outline"
        size="sm"
        className={`rounded-full h-8 px-3 ${template.status === 'active' ? 'border-yellow-500 text-yellow-500 hover:bg-yellow-50' : 'border-green-500 text-green-500 hover:bg-green-50'}`}
        disabled={updateMutation.isPending}
      >
        {template.status === 'active' ? <Pause className="size-3 mr-1" /> : <Play className="size-3 mr-1" />}
        {template.status === 'active' ? "Pause" : "Resume"}
      </Button>

      <Button
        onClick={handleDelete}
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 rounded-full"
        disabled={deleteMutation.isPending}
      >
        <Trash2 className="size-4" />
      </Button>
    </Center>
  );
};

export const columns: ColumnDef<RecurringInvoice>[] = [
  {
    accessorKey: "templateName",
    header: () => <Box className="text-foreground">Template Name</Box>,
    cell: ({ row }) => (
      <Box className="font-medium p-1">{row.original.templateName}</Box>
    ),
  },
  {
    accessorKey: "clientname",
    header: () => <Box className="text-foreground">Client</Box>,
    cell: ({ row }) => (
      <Box className="capitalize p-1">{row.original.clientname}</Box>
    ),
  },
  {
    accessorKey: "amount",
    header: () => <Box className="text-center text-foreground">Amount</Box>,
    cell: ({ row }) => {
      return <Box className="text-center font-semibold">$ {row.original.amount}</Box>;
    },
  },
  {
    accessorKey: "frequency",
    header: () => <Box className="text-center text-foreground">Frequency</Box>,
    cell: ({ row }) => (
      <Center>
        <Badge variant="outline" className="capitalize bg-blue-50 text-[#1797b9] border-[#1797b9]/20 px-2 py-0">
          <Clock className="size-3 mr-1" />
          {row.original.frequency}
        </Badge>
      </Center>
    ),
  },
  {
    accessorKey: "nextRunDate",
    header: () => <Box className="text-foreground text-center">Next Run</Box>,
    cell: ({ row }) => (
      <Center className="text-sm text-muted-foreground">
        <Calendar className="size-3 mr-1" />
        {new Date(row.original.nextRunDate).toLocaleDateString()}
      </Center>
    ),
  },
  {
    accessorKey: "status",
    header: () => <Box className="text-center text-foreground">Status</Box>,
    cell: ({ row }) => {
      const status = row.original.status;
      let colorClass = "bg-muted text-muted-foreground";
      if (status === "active") colorClass = "bg-green-100 text-green-700";
      if (status === "paused") colorClass = "bg-yellow-100 text-yellow-700";
      if (status === "completed") colorClass = "bg-blue-100 text-blue-700";

      return (
        <Center>
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${colorClass} capitalize`}>
            {status}
          </span>
        </Center>
      );
    },
  },
  {
    id: "actions",
    header: () => <Box className="text-center text-foreground">Actions</Box>,
    cell: ({ row }) => <RecurringActions template={row.original} />,
  },
];

export const RecurringInvoiceTable = () => {
  const { data, isLoading, error } = useFetchRecurringInvoices();

  if (isLoading) {
    return (
      <Center className="py-8">
        <Box className="flex items-center justify-center p-8">
          <Box className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1797b9]"></Box>
          <Box className="ml-2 text-muted-foreground">Loading templates...</Box>
        </Box>
      </Center>
    );
  }

  if (error) {
    return (
      <Center className="py-8">
        <Box className="text-red-500 bg-red-50 p-4 rounded-lg border border-red-100">
          Error loading templates: {error.message}
        </Box>
      </Center>
    );
  }

  const templatesData = data?.data || [];

  if (templatesData.length === 0) {
    return (
      <Center className="py-12 flex-col space-y-4">
        <Box className="p-4 bg-muted/50 rounded-full">
          <Clock className="size-12 text-muted-foreground" />
        </Box>
        <Box className="text-center">
          <p className="text-lg font-semibold text-foreground">No recurring templates</p>
          <p className="text-sm text-muted-foreground">Create your first recurring invoice to automate your billing.</p>
        </Box>
      </Center>
    );
  }

  return (
    <ReusableTable
      data={templatesData}
      columns={columns}
      enablePaymentLinksCalender={false}
      searchClassName="rounded-full"
      filterClassName="rounded-full"
    />
  );
};
