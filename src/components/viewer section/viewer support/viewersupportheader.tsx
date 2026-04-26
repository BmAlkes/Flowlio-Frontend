import { ComponentWrapper } from "../../common/componentwrapper";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Button } from "../../ui/button";
import { Stack } from "../../ui/stack";
import {
  GeneralModal,
  useGeneralModalDisclosure,
} from "../../common/generalmodal";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Form } from "../../ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import {
  useUniversalSupportTickets,
  getPriorityColor,
  getStatusColor,
  useCreateUniversalSupportTicket,
  type CreateUniversalSupportTicketRequest,
  type UniversalSupportTicket,
} from "@/hooks/useUniversalSupportTickets";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router";
import {
  useDeleteAllNotifications,
  useNotifications,
  useMarkNotificationAsRead,
} from "@/hooks/useNotifications";
import { ColumnDef } from "@tanstack/react-table";
import { ReusableTable } from "@/components/reusable/reusabletable";
import { Center } from "@/components/ui/center";
import { format, formatDistanceToNow } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MessageCircle, Hash, Plus, Loader2, Bell, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SupportChatModal } from "../../support/supportchatmodal";

const formSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.enum(["high", "medium", "low", "urgent"]),
});

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low:    { label: "Low",    color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 ring-slate-200 dark:ring-slate-700" },
  medium: { label: "Medium", color: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-50/80 ring-amber-200 dark:ring-amber-700" },
  high:   { label: "High",   color: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 hover:bg-orange-50/80 ring-orange-200 dark:ring-orange-700" },
  urgent: { label: "Urgent", color: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-50/80 ring-red-200 dark:ring-red-700" },
};

export const ViewerSupportHeader = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"all" | "open" | "closed">("all");
  const [selectedTicket, setSelectedTicket] = useState<UniversalSupportTicket | null>(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { subject: "", description: "", priority: "medium" },
  });

  const { data: ticketsData, isLoading: ticketsLoading, refetch } = useUniversalSupportTickets();
  const createTicketMutation = useCreateUniversalSupportTicket();
  const createModalProps = useGeneralModalDisclosure();
  const clearAllNotificationsMutation = useDeleteAllNotifications();
  const { data: notificationsData } = useNotifications({ limit: 10 });
  const markAsReadMutation = useMarkNotificationAsRead();

  useEffect(() => {
    const ticketId = searchParams.get("ticketId");
    if (ticketId && ticketsData?.data?.tickets) {
      const targetTicket = ticketsData.data.tickets.find(t => t.id === ticketId);
      if (targetTicket) {
        setSelectedTicket(targetTicket);
        setIsChatModalOpen(true);
      }
    }
  }, [searchParams, ticketsData]);

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) markAsReadMutation.mutate(notification.id);
    const ticketId = notification.data?.ticketId;
    if (ticketId) navigate(`/viewer/viewer-support?ticketId=${ticketId}`);
  };

  const getTableColumns = (): ColumnDef<UniversalSupportTicket>[] => [
    {
      accessorKey: "ticketNumber",
      header: () => <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ticket</span>,
      cell: ({ row }) => (
        <Flex className="items-center gap-1.5">
          <span className="text-sm font-semibold text-foreground/90">#{row.original.ticketNumber}</span>
        </Flex>
      ),
    },
    {
      accessorKey: "subject",
      header: () => <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Subject</span>,
      cell: ({ row }) => (
        <p className="text-sm text-foreground truncate max-w-[220px] capitalize">
          {row.original.subject}
        </p>
      ),
    },
    {
      accessorKey: "status",
      header: () => <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</span>,
      cell: ({ row }) => (
        <Badge variant="outline" className={`capitalize text-xs font-medium border-none ${getStatusColor(row.original.status)}`}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "priority",
      header: () => <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Priority</span>,
      cell: ({ row }) => (
        <Badge variant="outline" className={`capitalize text-xs font-medium border-none ${getPriorityColor(row.original.priority)}`}>
          {row.original.priority}
        </Badge>
      ),
    },
    {
      accessorKey: "createdon",
      header: () => <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Submitted</span>,
      cell: ({ row }) => (
        <Stack className="gap-0.5">
          <span className="text-sm text-foreground/80">{format(new Date(row.original.createdon), "MMM dd, yyyy")}</span>
          <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(row.original.createdon), { addSuffix: true })}</span>
        </Stack>
      ),
    },
    {
      id: "actions",
      header: () => <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</span>,
      cell: ({ row }) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 gap-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                onClick={() => {
                  setSelectedTicket(row.original);
                  setIsChatModalOpen(true);
                }}
              >
                <MessageCircle className="size-3.5" />
                Reply
              </Button>
            </TooltipTrigger>
            <TooltipContent>Open conversation</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
  ];

  const filteredTickets = ticketsData?.data?.tickets?.filter(t => {
    if (activeTab === "open") return t.status === "open" || t.status === "in_progress";
    if (activeTab === "closed") return t.status === "closed" || t.status === "resolved";
    return true;
  }) || [];

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const ticketData: CreateUniversalSupportTicketRequest = {
        subject: values.subject,
        description: values.description,
        priority: values.priority,
      };
      await createTicketMutation.mutateAsync(ticketData);
      form.reset();
      createModalProps.onOpenChange(false);
      refetch();
      toast.success("Support ticket created. We'll get back to you soon!");
    } catch (error) {
      toast.error("Failed to create ticket. Please try again.");
    }
  }

  const unreadCount = notificationsData?.data?.notifications?.filter((n: any) => !n.read).length ?? 0;

  return (
    <ComponentWrapper className="mt-8 px-8 pb-24 shadow-none">
      {/* Page Header */}
      <Flex className="justify-between items-start mb-10 pb-8 border-b border-border">
        <Stack className="gap-1">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-1">Support Center</p>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            How can we help you?
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track requests and communicate with our team.
          </p>
        </Stack>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 text-sm font-medium rounded-lg gap-2 shadow-sm transition-colors"
          onClick={() => createModalProps.onOpenChange(true)}
        >
          <Plus className="size-4" />
          New Ticket
        </Button>
      </Flex>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Notifications Sidebar */}
        <div className="lg:col-span-3">
          <Box className="border border-border rounded-xl overflow-hidden">
            <Flex className="justify-between items-center px-4 py-3 border-b border-border bg-muted/30">
              <Flex className="items-center gap-2">
                <Bell className="size-3.5 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">Updates</span>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center size-4 rounded-full bg-blue-600 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </Flex>
              {notificationsData?.data?.notifications?.length ? (
                <button
                  className="text-[11px] font-medium text-muted-foreground hover:text-red-500 transition-colors"
                  onClick={() => clearAllNotificationsMutation.mutate()}
                >
                  Clear all
                </button>
              ) : null}
            </Flex>

            <Box className="divide-y divide-border">
              {notificationsData?.data?.notifications?.length ? (
                notificationsData.data.notifications.map((n: any) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 cursor-pointer transition-colors ${
                      n.read
                        ? "hover:bg-muted/30"
                        : "bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    }`}
                    onClick={() => handleNotificationClick(n)}
                  >
                    <Flex className="items-start gap-2">
                      {!n.read && <span className="mt-1.5 size-1.5 rounded-full bg-blue-500 flex-shrink-0" />}
                      <Stack className="gap-0.5 min-w-0">
                        <p className={`text-xs truncate ${n.read ? "text-foreground/70" : "font-semibold text-foreground"}`}>
                          {n.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">{n.message}</p>
                      </Stack>
                    </Flex>
                  </div>
                ))
              ) : (
                <Center className="py-12 flex-col gap-2 text-muted-foreground">
                  <AlertCircle className="size-5 opacity-30" />
                  <p className="text-xs">No updates yet</p>
                </Center>
              )}
            </Box>
          </Box>
        </div>

        {/* Tickets Table */}
        <div className="lg:col-span-9">
          <Box className="border border-border rounded-xl overflow-hidden">
            <Flex className="justify-between items-center px-5 py-3 border-b border-border bg-muted/30">
              <Flex className="gap-1">
                {(["all", "open", "closed"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 h-8 rounded-md text-xs font-medium capitalize transition-colors ${
                      activeTab === tab
                        ? "bg-white dark:bg-muted text-foreground shadow-sm border border-border"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab === "all" ? "All" : tab === "open" ? "Active" : "Resolved"}
                  </button>
                ))}
              </Flex>
              <span className="text-xs text-muted-foreground">
                {filteredTickets.length} {filteredTickets.length === 1 ? "ticket" : "tickets"}
              </span>
            </Flex>

            {ticketsLoading ? (
              <Center className="h-72 flex-col gap-3 text-muted-foreground">
                <Loader2 className="size-5 animate-spin text-blue-500" />
                <p className="text-xs">Loading tickets...</p>
              </Center>
            ) : filteredTickets.length === 0 ? (
              <Center className="h-72 flex-col gap-2 text-muted-foreground">
                <Hash className="size-6 opacity-20" />
                <p className="text-sm">No tickets found</p>
                <p className="text-xs opacity-60">
                  {activeTab === "all" ? "Create your first ticket to get started." : `No ${activeTab} tickets at the moment.`}
                </p>
              </Center>
            ) : (
              <ReusableTable columns={getTableColumns()} data={filteredTickets} />
            )}
          </Box>
        </div>
      </div>

      <SupportChatModal
        isOpen={isChatModalOpen}
        ticket={selectedTicket}
        onClose={() => {
          setIsChatModalOpen(false);
          setSelectedTicket(null);
        }}
      />

      {/* New Ticket Modal */}
      <GeneralModal
        open={createModalProps.open}
        onOpenChange={createModalProps.onOpenChange}
        contentProps={{ className: "max-w-lg rounded-xl p-0 border border-border shadow-xl overflow-hidden" }}
      >
        <Box className="px-6 py-5 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">New support ticket</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Describe your issue and we'll get back to you.</p>
        </Box>

        <Box className="px-6 py-5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                      Subject
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="h-10 rounded-lg border-border bg-muted/20 text-sm"
                        placeholder="Brief summary of your issue"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-[110px] rounded-lg border-border bg-muted/20 text-sm resize-none"
                        placeholder="Describe the issue in detail..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                      Priority
                    </FormLabel>
                    <Flex className="gap-2">
                      {(["low", "medium", "high", "urgent"] as const).map((level) => {
                        const cfg = PRIORITY_CONFIG[level];
                        const isActive = field.value === level;
                        return (
                          <button
                            key={level}
                            type="button"
                            onClick={() => field.onChange(level)}
                            className={`flex-1 h-9 rounded-lg text-xs font-semibold capitalize transition-all ring-1 ${
                              isActive
                                ? `${cfg.color} ring-current`
                                : "bg-muted/40 text-muted-foreground ring-transparent hover:ring-border"
                            }`}
                          >
                            {cfg.label}
                          </button>
                        );
                      })}
                    </Flex>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Flex className="justify-end gap-2 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-9 px-4 text-sm rounded-lg"
                  onClick={() => createModalProps.onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-9 px-5 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm gap-2"
                  disabled={createTicketMutation.isPending}
                >
                  {createTicketMutation.isPending ? (
                    <Loader2 className="animate-spin size-4" />
                  ) : (
                    "Submit ticket"
                  )}
                </Button>
              </Flex>
            </form>
          </Form>
        </Box>
      </GeneralModal>
    </ComponentWrapper>
  );
};
