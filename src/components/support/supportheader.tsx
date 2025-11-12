import { ComponentWrapper } from "@/components/common/componentwrapper";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Button } from "../ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  formatTicketDate,
  useCreateUniversalSupportTicket,
  useUpdateUniversalSupportTicket,
  useDeleteUniversalSupportTicket,
  type CreateUniversalSupportTicketRequest,
  type UniversalSupportTicket,
} from "@/hooks/useUniversalSupportTickets";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
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
import { Trash2, Loader2 } from "lucide-react";

const formSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.enum(["high", "medium", "low", "urgent"]),
  client: z.string().optional(),
  assignedTo: z.string().optional(),
});

const SupportHeader = () => {
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
  const { data: activitiesResponse, isLoading: activitiesLoading } =
    useFetchOrganizationActivities();
  const { mutate: deleteActivity } = useDeleteActivity();

  const modalProps = useGeneralModalDisclosure();
  const [activeTab, setActiveTab] = useState<"submitted" | "recent" | "sent">(
    "submitted"
  );
  // Use the same hook as user management to get organization members
  const { data: organizationMembersData, isLoading: membersLoading } =
    useGetCurrentOrgUserMembers();

  const organizationMembers = organizationMembersData?.data?.userMembers || [];
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    if (activeTab === "submitted") {
      refetchSubmitted();
    } else if (activeTab === "sent") {
      refetchSentTickets();
    }
  }, [activeTab, refetchSubmitted, refetchSentTickets]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const ticketData: CreateUniversalSupportTicketRequest = {
        subject: values.subject,
        description: values.description,
        priority: values.priority,
        client: values.client,
        assignedToUser:
          values.assignedTo && values.assignedTo !== "no-assignment"
            ? values.assignedTo
            : undefined,
        assignedToOrganization: undefined,
      };

      await createTicketMutation.mutateAsync(ticketData);

      form.reset();
      modalProps.onOpenChange(false);
      // Refresh the appropriate tab
      if (activeTab === "submitted") {
        refetchSubmitted();
      }
      refetchSentTickets();
      toast.success("Support ticket created successfully!");
    } catch (error) {
      console.error("Error creating support ticket:", error);
      toast.error("Failed to create support ticket");
    }
  }

  const clearAllNotificationsMutation = useDeleteAllNotifications();
  const { data: notificationsData } = useNotifications({ limit: 10 });
  const markAsReadMutation = useMarkNotificationAsRead();
  const navigate = useNavigate();
  const { data: user } = useUser();
  const handleViewTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedTicket(null);
  };

  const handleNotificationClick = (notification: any) => {
    // Mark as read if not already read
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }

    // Navigate to support tickets page for support ticket notifications
    if (notification.type.includes("support_ticket")) {
      navigate("/dashboard/support");
    }
  };

  return (
    <ComponentWrapper className="mt-6 p-5 shadow-none">
      <Flex className="justify-between max-md:flex-col max-md:items-start">
        <Box>
          <h1 className="text-2xl font-medium capitalize">Support Center</h1>
          <p className="text-gray-500 mt-1 max-md:text-sm">
            Need Help? We’ve Got You Covered.
          </p>
        </Box>
      </Flex>

      <Flex className="justify-between max-md:flex-col max-md:items-start bg-white p-6 rounded-lg border border-gray-200 mt-5 shadow-sm">
        <Box className="flex-1">
          <Flex className="items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <h1 className="text-lg font-semibold text-gray-800">
              Your Tickets
            </h1>
          </Flex>
          <p className="text-gray-600 text-sm">
            {submittedData?.data?.tickets.length || 0} total tickets •{" "}
            {submittedData?.data?.tickets.filter(
              (ticket) => ticket.status === "open"
            ).length || 0}{" "}
            open •{" "}
            {submittedData?.data?.tickets.filter(
              (ticket) => ticket.status === "closed"
            ).length || 0}{" "}
            resolved
          </p>
        </Box>

        <Button
          variant="outline"
          className="bg-blue-600 hover:bg-blue-700 text-white border-none rounded-lg px-6 py-3 flex items-center gap-2 cursor-pointer h-12 font-medium"
          onClick={() => modalProps.onOpenChange(true)}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create New Ticket
        </Button>
      </Flex>

      <Flex className="justify-between max-md:flex-col max-md:items-start bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200 mt-5">
        <Box className="flex-1">
          <Flex className="items-center gap-3 mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <h1 className="text-lg font-semibold text-gray-800">
              Recent Notifications
            </h1>
          </Flex>
          <Flex className="justify-between items-center">
            <p className="text-gray-600 text-sm">
              {notificationsData?.data?.notifications?.filter(
                (n: any) => !n.read
              )?.length || 0}{" "}
              unread notifications
              {notificationsData?.data?.notifications?.filter(
                (n: any) => !n.read
              )?.length === 0 && " - You're all caught up!"}
            </p>
            {notificationsData?.data?.notifications &&
              notificationsData.data.notifications.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 ml-4"
                  onClick={() => clearAllNotificationsMutation.mutate()}
                  disabled={clearAllNotificationsMutation.isPending}
                >
                  {clearAllNotificationsMutation.isPending
                    ? "Clearing..."
                    : "Clear All Notifications"}
                </Button>
              )}
          </Flex>

          {/* Notification List */}
          {notificationsData?.data?.notifications &&
            notificationsData.data.notifications.length > 0 && (
              <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                {notificationsData.data.notifications
                  .sort((a: any, b: any) => {
                    // Sort unread notifications first, then by date
                    if (a.read !== b.read) {
                      return a.read ? 1 : -1;
                    }
                    return (
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                    );
                  })
                  .map((notification: any) => (
                    <div
                      key={notification.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-100 cursor-pointer transition-colors"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          notification.read ? "bg-gray-400" : "bg-blue-500"
                        }`}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {notification.message}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
              </div>
            )}
        </Box>
      </Flex>

      <Flex className="flex-col items-start bg-white p-6 rounded-lg border border-gray-200 mt-5 w-full shadow-sm">
        <Flex className="justify-between items-center w-full mb-6">
          <Flex className="items-center gap-3">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <h1 className="text-lg font-semibold text-gray-800">
              Support Tickets
            </h1>
          </Flex>
          <Flex className="gap-2">
            <Button
              variant={activeTab === "submitted" ? "default" : "outline"}
              size="sm"
              className={
                activeTab === "submitted"
                  ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  : "cursor-pointer"
              }
              onClick={() => setActiveTab("submitted")}
            >
              My Tickets
            </Button>
            <Button
              variant={activeTab === "recent" ? "default" : "outline"}
              size="sm"
              className={
                activeTab === "recent"
                  ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  : "cursor-pointer"
              }
              onClick={() => setActiveTab("recent")}
            >
              Recent Activity
            </Button>
            <Button
              variant={activeTab === "sent" ? "default" : "outline"}
              size="sm"
              className={
                activeTab === "sent"
                  ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  : "cursor-pointer"
              }
              onClick={() => setActiveTab("sent")}
            >
              Sent Tickets
            </Button>
          </Flex>
        </Flex>

        {activeTab === "submitted" && (
          <>
            {submittedLoading ? (
              <p className="text-gray-500">Loading your tickets...</p>
            ) : submittedError ? (
              <p className="text-red-500">
                Error loading tickets:{" "}
                {submittedError?.message || "Unknown error"}
              </p>
            ) : submittedData?.data?.tickets.length === 0 ? (
              <p className="text-gray-500">No tickets submitted yet.</p>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {submittedData?.data?.tickets?.map(
                  (ticket: any, index: number) => (
                    <AccordionItem key={ticket.id} value={`submitted-${index}`}>
                      <AccordionTrigger className="cursor-pointer">
                        <Stack>
                          <Flex className="items-center gap-2">
                            <h1 className="font-normal hover:underline text-[18px] capitalize">
                              {ticket.subject}
                            </h1>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                                ticket.status
                              )}`}
                            >
                              {ticket.status}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getPriorityColor(
                                ticket.priority
                              )}`}
                            >
                              {ticket.priority}
                            </span>
                          </Flex>
                          <p className="text-[#7184b4] text-sm font-normal">
                            Ticket #{ticket.ticketNumber} •{" "}
                            {formatTicketDate(ticket.createdon)}
                            {/* {ticket.assignedto && (
                              <span> • Assigned to: {ticket.assignedto}</span>
                            )} */}
                          </p>
                        </Stack>
                      </AccordionTrigger>
                      <AccordionContent className="flex flex-col gap-4 text-balance">
                        <p>Description: {ticket.description}</p>
                        {ticket.submittedbyName && (
                          <p className="text-sm text-gray-600">
                            <strong>Sent By:</strong> {ticket.submittedbyName}
                          </p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  )
                )}
              </Accordion>
            )}
          </>
        )}

        {activeTab === "recent" && (
          <>
            {activitiesLoading ? (
              <Center className="flex items-center justify-center h-64">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </Center>
            ) : activitiesResponse?.data?.activities?.length === 0 ? (
              <Center className="h-64">
                <Box className="text-lg text-gray-500">
                  No recent activities
                </Box>
              </Center>
            ) : (
              <>
                <Flex className="justify-end mb-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    onClick={() => {
                      const activities =
                        activitiesResponse?.data?.activities || [];
                      activities.forEach((activity) => {
                        deleteActivity({
                          id: activity.id,
                          source: activity.source || "recent",
                        });
                      });
                      toast.success("Clearing all activities...");
                    }}
                    disabled={activitiesLoading}
                  >
                    Clear All Activities
                  </Button>
                </Flex>
                <Box className="w-full space-y-3 max-h-[500px] overflow-y-auto">
                  {activitiesResponse?.data?.activities?.map((activity) => {
                    const dateObj =
                      typeof activity.date === "string"
                        ? new Date(activity.date)
                        : activity.date;
                    const timeAgo = formatDistanceToNow(dateObj, {
                      addSuffix: true,
                    });

                    return (
                      <Flex
                        key={activity.id}
                        className="items-start justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <Flex className="items-start gap-3 flex-1">
                          <Box className="size-2.5 border outline outline-slate-300 outline-offset-1 bg-slate-200 rounded-full mt-1.5" />
                          <Stack className="gap-1 flex-1">
                            <Flex className="items-center gap-2">
                              <h2 className="font-medium text-sm text-gray-800">
                                {activity.user}
                              </h2>
                              <p className="text-xs text-slate-500">
                                {timeAgo}
                              </p>
                            </Flex>
                            <p className="text-sm text-slate-600">
                              {activity.activity}
                            </p>
                          </Stack>
                        </Flex>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                          onClick={() => {
                            deleteActivity({
                              id: activity.id,
                              source: activity.source || "recent", // Default to "recent" if source not available
                            });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </Flex>
                    );
                  })}
                </Box>
              </>
            )}
          </>
        )}

        {activeTab === "sent" && (
          <>
            {sentTicketsLoading ? (
              <Center className="flex items-center justify-center h-64">
                <Box className="text-lg">Loading your sent tickets...</Box>
              </Center>
            ) : sentTicketsError ? (
              <Center className="h-64">
                <Box className="text-lg text-red-600">
                  Error loading sent tickets:{" "}
                  {sentTicketsError?.message || "Unknown error"}
                </Box>
              </Center>
            ) : (
              (() => {
                const sentTickets =
                  sentTicketsData?.data?.tickets?.filter(
                    (ticket: any) => ticket.submittedby === user?.user.id
                  ) || [];

                if (sentTickets.length === 0) {
                  return (
                    <Center className="h-64">
                      <Box className="text-lg text-gray-500">
                        You haven't sent any tickets yet.
                      </Box>
                    </Center>
                  );
                }

                const columns: ColumnDef<UniversalSupportTicket>[] = [
                  {
                    id: "ticketNumber",
                    header: () => (
                      <Box className="text-center text-black p-3">Ticket #</Box>
                    ),
                    cell: ({ row }) => (
                      <Box className="text-center p-3">
                        #{row.original.ticketNumber}
                      </Box>
                    ),
                    enableSorting: false,
                  },
                  {
                    accessorKey: "subject",
                    header: () => <Box className="text-black">Subject</Box>,
                    cell: ({ row }) => (
                      <Box className="capitalize w-30 max-sm:w-full">
                        {row.original.subject.length > 28
                          ? row.original.subject.slice(0, 28) + "..."
                          : row.original.subject}
                      </Box>
                    ),
                  },
                  {
                    accessorKey: "priority",
                    header: () => (
                      <Box className="text-center text-black">Priority</Box>
                    ),
                    cell: ({ row }) => {
                      const priority = row.original.priority;
                      return (
                        <Center className="text-center">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getPriorityColor(
                              priority
                            )}`}
                          >
                            {priority}
                          </span>
                        </Center>
                      );
                    },
                  },
                  {
                    accessorKey: "status",
                    header: () => (
                      <Box className="text-center text-black">Status</Box>
                    ),
                    cell: ({ row }) => {
                      const status = row.original.status as
                        | "open"
                        | "in_progress"
                        | "resolved"
                        | "closed";

                      const statusStyles: Record<
                        typeof status,
                        { text: string; dot: string }
                      > = {
                        open: {
                          text: "text-white bg-[#00A400] border-none rounded-full",
                          dot: "bg-white",
                        },
                        closed: {
                          text: "text-white bg-[#F98618] border-none rounded-full",
                          dot: "bg-white",
                        },
                        in_progress: {
                          text: "text-white bg-blue-500 border-none rounded-full",
                          dot: "bg-white",
                        },
                        resolved: {
                          text: "text-white bg-green-600 border-none rounded-full",
                          dot: "bg-white",
                        },
                      };

                      return (
                        <Center>
                          <Flex
                            className={`rounded-md capitalize w-26 h-10 gap-2 border items-center ${
                              statusStyles[status]?.text ||
                              statusStyles.open.text
                            }`}
                          >
                            <Flex className="ml-5.5">
                              <Flex
                                className={`w-2 h-2 rounded-full ${
                                  statusStyles[status]?.dot ||
                                  statusStyles.open.dot
                                }`}
                              />
                              <span>{status}</span>
                            </Flex>
                          </Flex>
                        </Center>
                      );
                    },
                  },
                  {
                    accessorKey: "createdon",
                    header: () => (
                      <Box className="text-center text-black">Created</Box>
                    ),
                    cell: ({ row }) => {
                      const createdon = row.original.createdon;
                      try {
                        return (
                          <Box className="text-center">
                            {format(new Date(createdon), "d MMM yyyy")}
                          </Box>
                        );
                      } catch (error) {
                        return (
                          <Box className="text-center">
                            {formatTicketDate(createdon)}
                            {error instanceof Error
                              ? error.message
                              : "Unknown error"}
                          </Box>
                        );
                      }
                    },
                  },
                  {
                    accessorKey: "actions",
                    header: () => (
                      <Box className="text-center text-black">Actions</Box>
                    ),
                    cell: ({ row }) => {
                      const ticket = row.original;
                      return (
                        <Center className="space-x-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewTicket(ticket);
                                  }}
                                >
                                  View
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="mb-2">
                                <p>View Ticket</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          {ticket.status === "open" && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateTicketMutation.mutate(
                                        {
                                          id: ticket.id,
                                          data: { status: "closed" },
                                        },
                                        {
                                          onSuccess: () => {
                                            toast.success(
                                              "Ticket closed successfully"
                                            );
                                            refetchSentTickets();
                                          },
                                          onError: (error: any) => {
                                            toast.error(
                                              error.response?.data?.message ||
                                                "Failed to close ticket"
                                            );
                                          },
                                        }
                                      );
                                    }}
                                  >
                                    Close
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="mb-2">
                                  <p>Close Ticket</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteTicketMutation.mutate(
                                      { id: ticket.id },
                                      {
                                        onSuccess: () => {
                                          toast.success(
                                            "Ticket deleted successfully"
                                          );
                                          refetchSentTickets();
                                        },
                                        onError: (error: any) => {
                                          toast.error(
                                            error.response?.data?.message ||
                                              "Failed to delete ticket"
                                          );
                                        },
                                      }
                                    );
                                  }}
                                >
                                  Delete
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="mb-2">
                                <p>Delete Ticket</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Center>
                      );
                    },
                  },
                ];

                return (
                  <ReusableTable
                    data={sentTickets}
                    columns={columns}
                    enablePaymentLinksCalender={false}
                    onRowClick={(row) => {
                      handleViewTicket(row.original);
                    }}
                  />
                );
              })()
            )}
          </>
        )}
      </Flex>

      <GeneralModal {...modalProps}>
        <h2 className="text-lg font-normal mb-4">
          Create Support Ticket for Viewer
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Box className="bg-white/80 gap-4 grid grid-cols-1">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white rounded-full placeholder:text-gray-400"
                        size="lg"
                        type="text"
                        placeholder="Enter ticket subject"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Flex>
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign To</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                membersLoading
                                  ? "Loading team members..."
                                  : "Select a team member"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="no-assignment">
                            No Assignment (General Support)
                          </SelectItem>
                          {organizationMembers.length === 0 ? (
                            <SelectItem value="no-members" disabled>
                              No team members available - Create users first
                            </SelectItem>
                          ) : (
                            organizationMembers.map((member) => (
                              <SelectItem
                                key={member.user?.id || member.id}
                                value={member.user?.id || member.id}
                              >
                                {member.user?.name ||
                                  `${member.firstname} ${member.lastname}`}{" "}
                                ({member.user?.role || member.userrole})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Flex>

              {organizationMembers.length === 0 && (
                <Box className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <p className="text-yellow-800 text-sm">
                    <strong>No team members found!</strong> You need to create
                    users with "viewer" role in your organization first. Go to
                    User Management to add team members.
                  </p>
                </Box>
              )}

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        className="bg-white rounded-md placeholder:text-gray-400"
                        placeholder="Describe your issue in detail"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="client"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white rounded-full placeholder:text-gray-400"
                        size="lg"
                        type="text"
                        placeholder="Enter client name if applicable"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                variant="outline"
                className="bg-[#1797b9] hover:bg-[#1797b9]/80 hover:text-white text-white border border-gray-200 rounded-full px-6 py-5 flex items-center gap-2 cursor-pointer"
                type="submit"
                disabled={createTicketMutation.isPending}
              >
                {createTicketMutation.isPending
                  ? "Creating..."
                  : "Create Ticket"}
              </Button>
            </Box>
          </form>
        </Form>
      </GeneralModal>

      {/* View Ticket Modal */}
      <GeneralModal
        {...modalProps}
        withoutCloseButton
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        contentProps={{
          className: "max-w-2xl w-full max-h-[90vh] overflow-y-auto p-0",
        }}
      >
        {selectedTicket && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Ticket #{selectedTicket.ticketNumber}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCloseViewModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>

            <div className="space-y-6">
              {/* Ticket Header Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Subject
                    </label>
                    <p className="text-lg font-semibold text-gray-800">
                      {selectedTicket.subject}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Status
                    </label>
                    <div className="mt-1">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          selectedTicket.status
                        )}`}
                      >
                        {selectedTicket.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Priority
                    </label>
                    <div className="mt-1">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
                          selectedTicket.priority
                        )}`}
                      >
                        {selectedTicket.priority}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Created
                    </label>
                    <p className="text-sm text-gray-800">
                      {formatTicketDate(selectedTicket.createdon)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  Description
                </label>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {selectedTicket.description}
                  </p>
                </div>
              </div>

              {/* Additional Info */}
              {selectedTicket.client && (
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    Client
                  </label>
                  <p className="text-gray-800 capitalize">
                    {selectedTicket.client}
                  </p>
                </div>
              )}

              {(selectedTicket.assignedUser ||
                selectedTicket.assignedOrganization ||
                selectedTicket.assignedto) && (
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    Assigned To
                  </label>
                  <p className="text-gray-800 capitalize">
                    {selectedTicket.assignedUser?.name ||
                      selectedTicket.assignedOrganization?.name ||
                      selectedTicket.assignedto ||
                      "Unassigned"}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                {selectedTicket.status === "open" && (
                  <Button
                    variant="outline"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                    onClick={() => {
                      updateTicketMutation.mutate(
                        { id: selectedTicket.id, data: { status: "closed" } },
                        {
                          onSuccess: () => {
                            toast.success("Ticket closed successfully");
                            refetchSentTickets();
                            handleCloseViewModal();
                          },
                          onError: (error: any) => {
                            toast.error(
                              error.response?.data?.message ||
                                "Failed to close ticket"
                            );
                          },
                        }
                      );
                    }}
                  >
                    Close Ticket
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  onClick={() => {
                    deleteTicketMutation.mutate(selectedTicket.id, {
                      onSuccess: () => {
                        toast.success("Ticket deleted successfully");
                        refetchSentTickets();
                        handleCloseViewModal();
                      },
                      onError: (error: any) => {
                        toast.error(
                          error.response?.data?.message ||
                            "Failed to delete ticket"
                        );
                      },
                    });
                  }}
                >
                  Delete Ticket
                </Button>
              </div>
            </div>
          </div>
        )}
      </GeneralModal>
    </ComponentWrapper>
  );
};

export default SupportHeader;
