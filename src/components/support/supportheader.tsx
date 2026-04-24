import { ComponentWrapper } from "@/components/common/componentwrapper";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Button } from "../ui/button";
import { Stack } from "../ui/stack";
import {
  GeneralModal,
  useGeneralModalDisclosure,
} from "../common/generalmodal";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form } from "../ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  useUniversalSupportTickets,
  getPriorityColor,
  getStatusColor,
  useCreateUniversalSupportTicket,
  useUpdateUniversalSupportTicket,
  useDeleteUniversalSupportTicket,
  type CreateUniversalSupportTicketRequest,
  type UniversalSupportTicket,
} from "@/hooks/useUniversalSupportTickets";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useSearchParams } from "react-router";
import {
  useDeleteAllNotifications,
  useNotifications,
  useMarkNotificationAsRead,
} from "@/hooks/useNotifications";
import { useGetCurrentOrgUserMembers } from "@/hooks/usegetallusermembers";
import { useUser } from "@/providers/user.provider";
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
import { useFetchOrganizationActivities } from "@/hooks/useFetchOrganizationActivities";
import { useDeleteActivity } from "@/hooks/useDeleteActivity";
import { Trash2, Loader2, MessageCircle, FileCheck, Hash, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { 
  Avatar, 
  AvatarFallback 
} from "@/components/ui/avatar";
import { SupportChatModal } from "./supportchatmodal";

const formSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.enum(["high", "medium", "low", "urgent"]),
  client: z.string().optional(),
  assignedTo: z.string().optional(),
});

const SupportHeader = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: user } = useUser();
  const isOrgOwner = user?.user?.isOrganizationOwner;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      description: "",
      priority: "medium",
      client: "",
      assignedTo: "",
    },
  });

  const [activeTab, setActiveTab] = useState<"submitted" | "recent" | "sent">("submitted");
  const [selectedTicket, setSelectedTicket] = useState<UniversalSupportTicket | null>(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  const {
    data: submittedData,
    isLoading: submittedLoading,
    error: submittedError,
    refetch: refetchSubmitted,
  } = useUniversalSupportTickets({ status: "open" });

  const {
    data: sentTicketsData,
    isLoading: sentTicketsLoading,
    error: sentTicketsError,
    refetch: refetchSentTickets,
  } = useUniversalSupportTickets();

  const createTicketMutation = useCreateUniversalSupportTicket();
  const updateTicketMutation = useUpdateUniversalSupportTicket();
  const deleteTicketMutation = useDeleteUniversalSupportTicket();
  
  const { data: activitiesResponse, isLoading: activitiesLoading } = useFetchOrganizationActivities();
  const { mutate: deleteActivity } = useDeleteActivity();
  const { data: organizationMembersData, isLoading: membersLoading } = useGetCurrentOrgUserMembers();
  const createModalProps = useGeneralModalDisclosure();

  const clearAllNotificationsMutation = useDeleteAllNotifications();
  const { data: notificationsData } = useNotifications({ limit: 10 });
  const markAsReadMutation = useMarkNotificationAsRead();

  useEffect(() => {
    if (activeTab === "submitted") refetchSubmitted();
    else if (activeTab === "sent") refetchSentTickets();
  }, [activeTab]);

  // Deep linking for notifications
  useEffect(() => {
    const ticketId = searchParams.get("ticketId");
    if (ticketId) {
      const allTickets = [
        ...(submittedData?.data?.tickets || []),
        ...(sentTicketsData?.data?.tickets || [])
      ];
      const targetTicket = allTickets.find(t => t.id === ticketId);
      if (targetTicket) {
        setSelectedTicket(targetTicket);
        setIsChatModalOpen(true);
      }
    }
  }, [searchParams, submittedData, sentTicketsData]);

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) markAsReadMutation.mutate(notification.id);
    const ticketId = notification.data?.ticketId;
    if (ticketId) navigate(`/dashboard/support?ticketId=${ticketId}`);
  };

  const getTableColumns = (): ColumnDef<UniversalSupportTicket>[] => [
    {
      accessorKey: "ticketNumber",
      header: () => <Box className="text-foreground font-semibold px-2">Ticket #</Box>,
      cell: ({ row }) => (
        <Flex className="items-center gap-2 px-2">
          <Hash className="size-3 text-blue-500" />
          <span className="font-medium text-blue-600">#{row.original.ticketNumber}</span>
        </Flex>
      ),
    },
    {
      accessorKey: "submittedbyName",
      header: () => <Box className="text-foreground font-semibold">User</Box>,
      cell: ({ row }) => {
        const member = organizationMembers.find(m => m.user?.id === row.original.submittedby);
        const displayName = member?.user?.name || row.original.submittedbyName;
        return (
          <Flex className="items-center gap-2">
            <Avatar className="size-6 border border-border">
              <AvatarFallback className="bg-muted text-[10px] font-bold">
                {displayName?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm truncate max-w-[120px]">{displayName}</span>
          </Flex>
        );
      },
    },
    {
      accessorKey: "subject",
      header: () => <Box className="text-foreground font-semibold">Subject</Box>,
      cell: ({ row }) => (
        <p className="text-sm font-medium text-foreground truncate max-w-[180px] capitalize">
          {row.original.subject}
        </p>
      ),
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
      header: () => <Box className="text-foreground font-semibold text-center">Date</Box>,
      cell: ({ row }) => (
        <Box className="text-xs text-muted-foreground text-center">
          {format(new Date(row.original.createdon), "MMM dd, yyyy")}
        </Box>
      ),
    },
    {
      id: "actions",
      header: () => <Box className="text-foreground font-semibold text-center">Actions</Box>,
      cell: ({ row }) => (
        <Flex className="justify-center items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600"
                  onClick={() => {
                    setSelectedTicket(row.original);
                    setIsChatModalOpen(true);
                  }}
                >
                  <MessageCircle className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open Chat</TooltipContent>
            </Tooltip>
          </TooltipProvider>
    
          {isOrgOwner && row.original.status !== "closed" && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-full hover:bg-green-50 dark:hover:bg-green-900/30 text-green-600"
                    onClick={() => {
                      if (window.confirm("Finalize and close this ticket? Record will be kept but chat will be locked.")) {
                        updateTicketMutation.mutate({ 
                          id: row.original.id, 
                          data: { status: "closed" } 
                        }, {
                          onSuccess: () => toast.success("Ticket closed & locked successfully")
                        });
                      }
                    }}
                    disabled={updateTicketMutation.isPending}
                  >
                    {updateTicketMutation.isPending ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <FileCheck className="size-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Resolve & Lock</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
    
          {isOrgOwner && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600"
                    onClick={() => {
                      if (window.confirm("Are you sure? This will permanently delete the ticket and all messages.")) {
                        deleteTicketMutation.mutate({ id: row.original.id }, {
                          onSuccess: () => toast.success("Ticket permanently deleted")
                        });
                      }
                    }}
                    disabled={deleteTicketMutation.isPending}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete Permanently</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </Flex>
      ),
    },
  ];

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const ticketData: CreateUniversalSupportTicketRequest = {
        subject: values.subject,
        description: values.description,
        priority: values.priority,
        client: values.client,
        assignedToUser: values.assignedTo && values.assignedTo !== "no-assignment" ? values.assignedTo : undefined,
      };
      await createTicketMutation.mutateAsync(ticketData);
      form.reset();
      createModalProps.onOpenChange(false);
      refetchSubmitted();
      refetchSentTickets();
      toast.success(t("support.ticketCreatedSuccess"));
    } catch (error) {
      toast.error(t("support.ticketCreateError"));
    }
  }

  const organizationMembers = organizationMembersData?.data?.userMembers || [];

  return (
    <ComponentWrapper className="mt-10 p-8 shadow-none pb-20">
      <Flex className="justify-between max-md:flex-col max-md:items-start mb-6">
        <Box>
          <h1 className="text-2xl font-bold tracking-tight capitalize">{t("support.centerTitle")}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t("support.centerSubtitle")}
          </p>
        </Box>
      </Flex>

      {/* Stats and Action Header */}
      <Flex className="justify-between items-center bg-card p-6 rounded-2xl border border-border mt-5 shadow-sm">
        <Stack className="gap-1">
          <Flex className="items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
            <h2 className="text-lg font-bold text-foreground">{t("support.yourTickets")}</h2>
          </Flex>
          <p className="text-muted-foreground text-sm">
            {submittedData?.data?.tickets.length || 0} Total •{" "}
            {submittedData?.data?.tickets.filter(t => t.status === "open").length || 0} Open
          </p>
        </Stack>

        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 h-12 font-semibold shadow-lg shadow-blue-500/20 flex items-center gap-2"
          onClick={() => createModalProps.onOpenChange(true)}
        >
          <Plus className="size-4" />
          {t("support.createNewTicket")}
        </Button>
      </Flex>

      {/* Notifications Section */}
      <Box className="bg-card p-6 rounded-2xl border border-border mt-6 shadow-sm">
        <Flex className="justify-between items-center mb-4">
          <Flex className="items-center gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
            <h2 className="text-lg font-bold text-foreground">{t("support.recentNotifications")}</h2>
          </Flex>
          {notificationsData?.data?.notifications?.length ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600 hover:bg-red-50 text-xs"
              onClick={() => clearAllNotificationsMutation.mutate()}
            >
              {t("support.clearAll")}
            </Button>
          ) : null}
        </Flex>

        <Box className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {notificationsData?.data?.notifications?.length ? (
            notificationsData.data.notifications.map((n: any) => (
              <Flex
                key={n.id}
                className={`items-center gap-3 p-3 rounded-xl cursor-pointer transition-all hover:translate-x-1 ${n.read ? "bg-muted/30" : "bg-blue-50/50 border-l-4 border-blue-500"}`}
                onClick={() => handleNotificationClick(n)}
              >
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${n.read ? "text-foreground/70" : "font-bold text-foreground"}`}>{n.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </span>
              </Flex>
            ))
          ) : (
            <p className="text-sm text-muted-foreground italic text-center py-4">{t("support.noNewNotifications")}</p>
          )}
        </Box>
      </Box>

      {/* Main Support Management Section */}
      <Box className="bg-card p-6 rounded-2xl border border-border mt-6 shadow-sm">
        <Flex className="justify-between items-center w-full mb-8 border-b border-border pb-4">
          <Flex className="items-center gap-3">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <h2 className="text-lg font-bold text-foreground">{t("support.supportManagement")}</h2>
          </Flex>
          <Flex className="bg-muted/50 p-1 rounded-xl gap-1">
            <Button
              variant={activeTab === "submitted" ? "default" : "ghost"}
              size="sm"
              className={`rounded-lg px-4 ${activeTab === "submitted" ? "bg-white text-blue-600 shadow-sm hover:bg-white" : ""}`}
              onClick={() => setActiveTab("submitted")}
            >
              {t("support.myTickets")}
            </Button>
            <Button
              variant={activeTab === "recent" ? "default" : "ghost"}
              size="sm"
              className={`rounded-lg px-4 ${activeTab === "recent" ? "bg-white text-blue-600 shadow-sm hover:bg-white" : ""}`}
              onClick={() => setActiveTab("recent")}
            >
              {t("support.activityLog")}
            </Button>
            <Button
              variant={activeTab === "sent" ? "default" : "ghost"}
              size="sm"
              className={`rounded-lg px-4 ${activeTab === "sent" ? "bg-white text-blue-600 shadow-sm hover:bg-white" : ""}`}
              onClick={() => setActiveTab("sent")}
            >
              {t("support.sentTickets")}
            </Button>
          </Flex>
        </Flex>

        {activeTab === "submitted" && (
          <Box>
            {submittedLoading ? (
              <Center className="h-64 flex-col gap-2 opacity-50">
                <Loader2 className="size-6 animate-spin text-blue-500" />
                <p className="text-sm font-medium animate-pulse">{t("support.loadingTickets")}</p>
              </Center>
            ) : submittedError ? (
              <Center className="h-64 text-red-500">Error loading tickets</Center>
            ) : (
              <ReusableTable columns={getTableColumns()} data={submittedData?.data?.tickets || []} />
            )}
          </Box>
        )}

        {activeTab === "recent" && (
          <Box className="w-full space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {activitiesLoading ? (
              <Center className="h-64"><Loader2 className="size-6 animate-spin text-muted-foreground"/></Center>
            ) : activitiesResponse?.data?.activities?.length === 0 ? (
              <Center className="h-64 text-muted-foreground">{t("support.noRecentActivity")}</Center>
            ) : (
              activitiesResponse?.data?.activities?.map((activity) => (
                <Flex key={activity.id} className="items-start justify-between p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors">
                  <Flex className="gap-3">
                    <div className="size-2 bg-blue-500 rounded-full mt-2 shadow-[0_0_6px_rgba(59,130,246,0.5)]"></div>
                    <Stack className="gap-0.5">
                      <Flex className="items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{activity.user}</span>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{formatDistanceToNow(new Date(activity.date), { addSuffix: true })}</span>
                      </Flex>
                      <p className="text-sm text-muted-foreground leading-relaxed">{activity.activity}</p>
                    </Stack>
                  </Flex>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-full text-red-400 hover:text-red-500 hover:bg-red-50"
                    onClick={() => deleteActivity({ id: activity.id, source: activity.source || "recent" })}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </Flex>
              ))
            )}
          </Box>
        )}

        {activeTab === "sent" && (
          <Box>
            {sentTicketsLoading ? (
              <Center className="h-64 opacity-50"><Loader2 className="size-6 animate-spin text-blue-500"/></Center>
            ) : sentTicketsError ? (
              <Center className="h-64 text-red-500">Error loading sent tickets</Center>
            ) : (
              <ReusableTable columns={getTableColumns()} data={sentTicketsData?.data?.tickets?.filter(t => t.submittedby === user?.user?.id) || []} />
            )}
          </Box>
        )}
      </Box>

      {/* Chat Modal */}
      <SupportChatModal 
        isOpen={isChatModalOpen} 
        ticket={selectedTicket} 
        onClose={() => {
          setIsChatModalOpen(false);
          setSelectedTicket(null);
        }} 
      />

      {/* Create Ticket Modal */}
      <GeneralModal {...createModalProps} contentProps={{ className: "max-w-xl" }}>
        <h2 className="text-xl font-bold mb-6 text-foreground border-b border-border pb-4">Create Support Ticket</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">Subject</FormLabel>
                  <FormControl>
                    <Input className="rounded-xl border-border focus:ring-blue-500" placeholder="Summary of the issue" {...field} />
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
                  <FormLabel className="text-sm font-semibold">Description</FormLabel>
                  <FormControl>
                    <Textarea className="min-h-[120px] rounded-xl border-border focus:ring-blue-500" placeholder="Provide detailed information..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Flex className="gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-sm font-semibold">Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl border-border">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-sm font-semibold">Assign To</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl border-border">
                          <SelectValue placeholder={membersLoading ? "Loading members..." : "No Assignment"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="no-assignment">No Assignment</SelectItem>
                        {organizationMembers
                          .filter((m: any) => m.user?.id)
                          .map((member: any) => (
                          <SelectItem key={member.id} value={member.user.id}>
                            {member.user?.name || `${member.firstname} ${member.lastname}`.trim()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </Flex>
            <Flex className="justify-end gap-2 pt-4">
              <Button type="button" variant="ghost" className="rounded-xl px-6" onClick={() => createModalProps.onOpenChange(false)}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 shadow-lg shadow-blue-500/20" disabled={createTicketMutation.isPending}>
                {createTicketMutation.isPending ? "Creating..." : "Create Ticket"}
              </Button>
            </Flex>
          </form>
        </Form>
      </GeneralModal>
    </ComponentWrapper>
  );
};

export default SupportHeader;
