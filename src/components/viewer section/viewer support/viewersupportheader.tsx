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
import { MessageCircle, Hash, Plus, Loader2, Calendar, Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SupportChatModal } from "../../support/supportchatmodal";

const formSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.enum(["high", "medium", "low", "urgent"]),
});

export const ViewerSupportHeader = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"all" | "open" | "closed">("all");
  const [selectedTicket, setSelectedTicket] = useState<UniversalSupportTicket | null>(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      description: "",
      priority: "medium",
    },
  });

  const {
    data: ticketsData,
    isLoading: ticketsLoading,
    refetch,
  } = useUniversalSupportTickets();

  const createTicketMutation = useCreateUniversalSupportTicket();
  const createModalProps = useGeneralModalDisclosure();
  const clearAllNotificationsMutation = useDeleteAllNotifications();
  const { data: notificationsData } = useNotifications({ limit: 10 });
  const markAsReadMutation = useMarkNotificationAsRead();

  // Deep linking for notifications
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
      header: () => <Box className="text-foreground font-semibold px-2">Ticket ID</Box>,
      cell: ({ row }) => (
        <Flex className="items-center gap-2 px-2">
          <Hash className="size-3 text-blue-500" />
          <span className="font-bold text-blue-600">#{row.original.ticketNumber}</span>
        </Flex>
      ),
    },
    {
      accessorKey: "subject",
      header: () => <Box className="text-foreground font-semibold">Requirement</Box>,
      cell: ({ row }) => (
        <p className="text-sm font-semibold text-foreground truncate max-w-[200px] capitalize">
          {row.original.subject}
        </p>
      ),
    },
    {
      accessorKey: "status",
      header: () => <Box className="text-center text-foreground font-semibold">Status</Box>,
      cell: ({ row }) => (
        <Center>
          <Badge variant="outline" className={`capitalize rounded-full px-3 py-1 border-none shadow-sm ${getStatusColor(row.original.status)}`}>
            {row.original.status}
          </Badge>
        </Center>
      ),
    },
    {
      accessorKey: "priority",
      header: () => <Box className="text-center text-foreground font-semibold">Level</Box>,
      cell: ({ row }) => (
        <Center>
          <Badge variant="outline" className={`capitalize rounded-full px-3 py-1 border-none shadow-sm ${getPriorityColor(row.original.priority)}`}>
            {row.original.priority}
          </Badge>
        </Center>
      ),
    },
    {
      accessorKey: "createdon",
      header: () => <Box className="text-foreground font-semibold text-center">Submitted</Box>,
      cell: ({ row }) => (
        <Box className="text-xs text-muted-foreground text-center flex flex-col items-center">
          <span className="font-medium text-foreground/80">{format(new Date(row.original.createdon), "MMM dd, yyyy")}</span>
          <span className="text-[10px] opacity-70">{formatDistanceToNow(new Date(row.original.createdon), { addSuffix: true })}</span>
        </Box>
      ),
    },
    {
      id: "actions",
      header: () => <Box className="text-foreground font-semibold text-center">Interaction</Box>,
      cell: ({ row }) => (
        <Center>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-10 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 shadow-sm border border-transparent hover:border-blue-100 dark:hover:border-blue-500/30 transition-all"
                  onClick={() => {
                    setSelectedTicket(row.original);
                    setIsChatModalOpen(true);
                  }}
                >
                  <MessageCircle className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Start Conversation</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Center>
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

  return (
    <ComponentWrapper className="mt-10 p-8 shadow-none pb-24">
      {/* Header Section */}
      <Flex className="justify-between items-end mb-10 border-b border-border pb-8">
        <Stack className="gap-2">
          <Badge className="w-fit bg-blue-100 text-blue-600 hover:bg-blue-100/80 border-none px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-1">
            Support Center
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            How can we <span className="text-blue-600">help you?</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-lg">
            Track your requests, communicate with our team, and get the assistance you need to keep moving forward.
          </p>
        </Stack>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-8 h-14 font-bold shadow-xl shadow-blue-500/30 flex items-center gap-3 transition-transform active:scale-95"
          onClick={() => createModalProps.onOpenChange(true)}
        >
          <Plus className="size-5" />
          Raise New Ticket
        </Button>
      </Flex>

      {/* Grid Layout for Notifications and Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Notifications */}
        <div className="lg:col-span-3 space-y-6">
          <Box className="bg-gradient-to-br from-white to-blue-50/30 dark:from-muted/20 dark:to-muted/5 p-6 rounded-[2rem] border border-blue-100 dark:border-border/50 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 dark:bg-blue-500/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-blue-200/40 transition-colors"></div>
            
            <Flex className="justify-between items-center mb-6 relative">
              <Flex className="items-center gap-3">
                <div className="size-3 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                <h3 className="font-bold text-foreground">Updates</h3>
              </Flex>
              {notificationsData?.data?.notifications?.length ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-[10px] h-6 px-2 text-red-500 hover:bg-red-50 font-bold uppercase tracking-tighter"
                  onClick={() => clearAllNotificationsMutation.mutate()}
                >
                  Clear
                </Button>
              ) : null}
            </Flex>

            <Box className="space-y-3 relative">
              {notificationsData?.data?.notifications?.length ? (
                notificationsData.data.notifications.map((n: any) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-2xl cursor-pointer transition-all border ${n.read ? "bg-white/50 dark:bg-muted/10 border-transparent text-foreground/70" : "bg-white dark:bg-muted/20 border-blue-100 dark:border-blue-500/20 shadow-sm hover:border-blue-400 dark:hover:border-blue-500"}`}
                    onClick={() => handleNotificationClick(n)}
                  >
                    <p className={`text-xs ${n.read ? "text-foreground/60" : "font-bold text-foreground"}`}>{n.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">{n.message}</p>
                  </div>
                ))
              ) : (
                <Center className="py-8 text-muted-foreground italic text-xs">No updates at the moment</Center>
              )}
            </Box>
          </Box>
        </div>

        {/* Right Column: Dynamic Table */}
        <div className="lg:col-span-9">
          <Box className="bg-white dark:bg-muted/10 p-7 rounded-[2.5rem] border border-border shadow-sm">
            <Flex className="justify-between items-center mb-8">
              <Flex className="gap-2 bg-muted/30 p-1 rounded-2xl border border-border/50">
                <Button
                  variant={activeTab === "all" ? "default" : "ghost"}
                  size="sm"
                  className={`rounded-xl px-6 h-10 ${activeTab === "all" ? "bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm font-bold border border-blue-100 dark:border-blue-500/30" : "text-muted-foreground font-medium hover:bg-muted"}`}
                  onClick={() => setActiveTab("all")}
                >
                  All History
                </Button>
                <Button
                  variant={activeTab === "open" ? "default" : "ghost"}
                  size="sm"
                  className={`rounded-xl px-6 h-10 ${activeTab === "open" ? "bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm font-bold border border-blue-100 dark:border-blue-500/30" : "text-muted-foreground font-medium hover:bg-muted"}`}
                  onClick={() => setActiveTab("open")}
                >
                  Active
                </Button>
                <Button
                  variant={activeTab === "closed" ? "default" : "ghost"}
                  size="sm"
                  className={`rounded-xl px-6 h-10 ${activeTab === "closed" ? "bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm font-bold border border-blue-100 dark:border-blue-500/30" : "text-muted-foreground font-medium hover:bg-muted"}`}
                  onClick={() => setActiveTab("closed")}
                >
                  Resolved
                </Button>
              </Flex>
              
              <Flex className="gap-2">
                <Button variant="outline" size="icon" className="rounded-xl size-10 border-border text-muted-foreground hover:bg-muted/50"><Search className="size-4"/></Button>
                <Button variant="outline" size="icon" className="rounded-xl size-10 border-border text-muted-foreground hover:bg-muted/50"><Filter className="size-4"/></Button>
              </Flex>
            </Flex>

            {ticketsLoading ? (
              <Center className="h-80 flex-col gap-4 opacity-70">
                <div className="relative">
                  <div className="size-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="size-5 text-blue-500 animate-pulse" />
                  </div>
                </div>
                <p className="font-bold text-blue-600/60 tracking-widest text-[10px] uppercase">Retrieving Records</p>
              </Center>
            ) : filteredTickets.length === 0 ? (
              <Center className="h-80 flex-col gap-3 text-muted-foreground">
                <div className="bg-muted/40 p-4 rounded-full mb-2"><Hash className="size-8 opacity-20"/></div>
                <p className="font-medium">No records found for this category</p>
              </Center>
            ) : (
              <ReusableTable columns={getTableColumns()} data={filteredTickets} />
            )}
          </Box>
        </div>
      </div>

      {/* Modern Interaction Modal */}
      <SupportChatModal 
        isOpen={isChatModalOpen} 
        ticket={selectedTicket} 
        onClose={() => {
          setIsChatModalOpen(false);
          setSelectedTicket(null);
        }} 
      />

      {/* Creation Flow Modal */}
      <GeneralModal open={createModalProps.open} onOpenChange={createModalProps.onOpenChange} contentProps={{ className: "max-w-2xl rounded-[2.5rem] p-6 border-none shadow-2xl" }}>
        <Stack className="gap-1 mb-4 border-b border-border pb-4">
          <Badge className="w-fit bg-orange-100 text-orange-600 border-none px-3 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase">New Submission</Badge>
          <h2 className="text-3xl font-black text-foreground tracking-tight">Technical Assistance</h2>
          <p className="text-muted-foreground text-sm">Please provide a clear subject and detailed description of your request.</p>
        </Stack>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-widest text-foreground/70 flex items-center gap-2">
                    <Calendar className="size-3"/> Topic / Summary
                  </FormLabel>
                  <FormControl>
                    <Input className="h-12 rounded-2xl border-border bg-muted/20 focus:bg-white focus:ring-blue-500 transition-all font-medium" placeholder="E.g. Access problem with module X" {...field} />
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
                  <FormLabel className="text-xs font-bold uppercase tracking-widest text-foreground/70 flex items-center gap-2">
                    <Hash className="size-3"/> Full Description
                  </FormLabel>
                  <FormControl>
                    <Textarea className="min-h-[120px] rounded-3xl border-border bg-muted/20 focus:bg-white focus:ring-blue-500 transition-all p-4 font-medium leading-relaxed" placeholder="Tell us more about the issue or request..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-xs font-bold uppercase tracking-widest text-foreground/70 flex items-center gap-2">
                    Urgency Level
                  </FormLabel>
                  <Flex className="gap-2 p-1 bg-muted/30 rounded-2xl border border-border/50">
                    {["low", "medium", "high", "urgent"].map((level) => (
                      <button
                        key={level}
                        type="button"
                        className={`flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${field.value === level ? "bg-white text-blue-600 shadow-sm border border-blue-100" : "text-muted-foreground hover:bg-white/50"}`}
                        onClick={() => field.onChange(level)}
                      >
                        {level}
                      </button>
                    ))}
                  </Flex>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Flex className="justify-end gap-3 pt-6 border-t border-border mt-10">
              <Button type="button" variant="ghost" className="rounded-2xl px-8 h-14 font-bold text-muted-foreground" onClick={() => createModalProps.onOpenChange(false)}>Discard</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-12 h-14 font-black shadow-xl shadow-blue-500/20 transition-all active:scale-95" disabled={createTicketMutation.isPending}>
                {createTicketMutation.isPending ? <Loader2 className="animate-spin size-5"/> : "Submit Request"}
              </Button>
            </Flex>
          </form>
        </Form>
      </GeneralModal>
    </ComponentWrapper>
  );
};


