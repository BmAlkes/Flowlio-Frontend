import { ColumnDef } from "@tanstack/react-table";
import { Center } from "@/components/ui/center";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { MessageCircle, FileCheck, Trash2, Hash, Building2 } from "lucide-react";
import { ReusableTable } from "@/components/reusable/reusabletable";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import type { UniversalSupportTicket } from "@/hooks/useUniversalSupportTickets";
import { 
  useUpdateUniversalSupportTicket, 
  getPriorityColor, 
  getStatusColor 
} from "@/hooks/useUniversalSupportTickets";
import { useTranslation } from "react-i18next";
import { TableSkeleton, ErrorState } from "@/components/skeletons";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SupportChatModal } from "@/components/support/supportchatmodal";

export type Data = UniversalSupportTicket;

export const SupportTicketTable = ({
  data,
  isLoading,
  isFetching,
  error,
  refetch,
  pagination,
  onPageChange,
  deleteSupportTicket,
}: {
  data: UniversalSupportTicket[];
  isLoading: boolean;
  isFetching?: boolean;
  error: any;
  refetch: () => void;
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    total: number;
  };
  onPageChange?: (page: number) => void;
  deleteSupportTicket: (id: string) => void;
}) => {
  const { t } = useTranslation();
  const [selectedTicket, setSelectedTicket] = useState<Data | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { mutate: updateSupportTicket } = useUpdateUniversalSupportTicket();

  const loading = isLoading || isFetching;

  const handleViewTicket = (ticket: Data) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const columns: ColumnDef<Data>[] = [
    {
      accessorKey: "ticketNumber",
      header: () => <Box className="text-foreground font-semibold px-2">Ticket #</Box>,
      cell: ({ row }) => (
        <Flex className="items-center gap-2 px-2">
          <Hash className="size-3 text-blue-500" />
          <span className="font-bold text-blue-600">#{row.original.ticketNumber}</span>
        </Flex>
      ),
    },
    {
      accessorKey: "subject",
      header: () => <Box className="text-foreground font-semibold">Subject</Box>,
      cell: ({ row }) => (
        <p className="text-sm font-semibold text-foreground truncate max-w-[200px] capitalize">
          {row.original.subject}
        </p>
      ),
    },
    {
      accessorKey: "client",
      header: () => <Box className="text-foreground font-semibold">Client / Org</Box>,
      cell: ({ row }) => {
        const clientValue = row.original.client;
        const isId = clientValue && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clientValue);
        const orgName = row.original.clientOrganization?.name || (isId || clientValue === "General" ? "" : clientValue) || "-";
        return (
          <Flex className="items-center gap-2">
            <Building2 className="size-3.5 text-muted-foreground" />
            <span className="text-sm truncate max-w-[150px]">{orgName}</span>
          </Flex>
        );
      },
    },
    {
      accessorKey: "assignedto",
      header: () => <Box className="text-foreground font-semibold">Assigned To</Box>,
      cell: ({ row }) => {
        const name = row.original.assignedUser?.name || row.original.assignedOrganization?.name || row.original.assignedto || "Unassigned";
        return (
          <Flex className="items-center gap-2">
            <Avatar className="size-6 border border-border">
              <AvatarFallback className="bg-muted text-[10px] uppercase">{name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <span className="text-sm truncate max-w-[120px]">{name}</span>
          </Flex>
        );
      },
    },
    {
      accessorKey: "status",
      header: () => <Box className="text-center text-foreground font-semibold">Status</Box>,
      cell: ({ row }) => (
        <Center>
          <Badge variant="outline" className={`capitalize rounded-full px-2.5 py-0.5 border-none ${getStatusColor(row.original.status)}`}>
            {row.original.status}
          </Badge>
        </Center>
      ),
    },
    {
      accessorKey: "priority",
      header: () => <Box className="text-center text-foreground font-semibold">Priority</Box>,
      cell: ({ row }) => (
        <Center>
          <Badge variant="outline" className={`capitalize rounded-full px-2.5 py-0.5 border-none ${getPriorityColor(row.original.priority)}`}>
            {row.original.priority}
          </Badge>
        </Center>
      ),
    },
    {
      accessorKey: "createdon",
      header: () => <Box className="text-center text-foreground font-semibold">Created</Box>,
      cell: ({ row }) => (
        <Box className="text-xs text-muted-foreground text-center">
          {format(new Date(row.original.createdon), "MMM dd, yyyy")}
        </Box>
      ),
    },
    {
      id: "actions",
      header: () => <Box className="text-center text-foreground font-semibold">Actions</Box>,
      cell: ({ row }) => (
        <Flex className="justify-center items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600"
                  onClick={() => handleViewTicket(row.original)}
                >
                  <MessageCircle className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open Chat</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {row.original.status !== "closed" && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-full hover:bg-green-50 dark:hover:bg-green-900/30 text-green-600"
                    onClick={() => {
                      if (window.confirm("Mark as resolved and finalize conversation?")) {
                        updateSupportTicket({ 
                          id: row.original.id, 
                          data: { status: "closed" } 
                        }, {
                          onSuccess: () => {
                            toast.success("Ticket closed & locked");
                            refetch();
                          }
                        });
                      }
                    }}
                  >
                    <FileCheck className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Resolve & Lock</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600"
                  onClick={() => {
                    if (window.confirm("Permanently delete this ticket and all history?")) {
                      deleteSupportTicket(row.original.id);
                      refetch();
                    }
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete Permanently</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Flex>
      ),
    },
  ];

  if (loading && (!data || data.length === 0)) {
    return (
      <Box className="bg-white dark:bg-muted/10 rounded-[2rem] border border-border p-8 mt-6">
        <TableSkeleton rows={8} columns={8} withActions />
      </Box>
    );
  }

  if (error && (!data || data.length === 0)) {
    return (
      <Center className="py-20 bg-white dark:bg-muted/10 rounded-[2rem] border border-border mt-6">
        <ErrorState title={t("common.error")} message={error.message || "Failed to load support tickets"} />
      </Center>
    );
  }

  return (
    <Box className="bg-white dark:bg-muted/10 rounded-[2.5rem] border border-border p-8 mt-6 shadow-sm">
      <ReusableTable
        data={data ?? []}
        columns={columns}
        pagination={
          onPageChange
            ? {
                pageIndex: (pagination?.page ?? 1) - 1,
                pageSize: pagination?.limit ?? 20,
                pageCount: pagination?.totalPages ?? 1,
                total: pagination?.total ?? 0,
                onPageChange: (newPage: number) => onPageChange(newPage + 1),
              }
            : undefined
        }
      />

      <SupportChatModal 
        isOpen={isModalOpen} 
        ticket={selectedTicket} 
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTicket(null);
        }} 
      />
    </Box>
  );
};
