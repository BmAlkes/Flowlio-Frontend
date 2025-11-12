import { ComponentWrapper } from "@/components/common/componentwrapper";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Stack } from "@/components/ui/stack";
import {
  GeneralModal,
  useGeneralModalDisclosure,
} from "@/components/common/generalmodal";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Form } from "@/components/ui/form"; // or "@/components/ui/form"
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { useViewerSupportTickets } from "@/hooks/useViewerSupportTickets";
import { useUser } from "@/providers/user.provider";
import { useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  useDeleteAllNotifications,
  useNotifications,
  useMarkNotificationAsRead,
} from "@/hooks/useNotifications";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const formSchema = z.object({
  clientname: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().min(2, {
    message: "Must be proper description",
  }),
});

export const ViewerSupportHeader = () => {
  const { data: user } = useUser();
  const { data: ticketsData, isLoading, error } = useViewerSupportTickets();
  const clearAllNotificationsMutation = useDeleteAllNotifications();
  const { data: notificationsData } = useNotifications({ limit: 10 });
  const markAsReadMutation = useMarkNotificationAsRead();
  const navigate = useNavigate();

  // Debug logging for viewer tickets
  useEffect(() => {}, [ticketsData, isLoading, error, user]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientname: "",
      description: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }
  const modalProps = useGeneralModalDisclosure();

  return (
    <ComponentWrapper className="mt-6 p-5 shadow-none">
      <Flex className="justify-between max-md:flex-col max-md:items-start">
        <Box>
          <h1 className="text-2xl font-medium capitalize">
            Support & Create Your Ticket
          </h1>
          <p className="text-gray-500 mt-1 max-md:text-sm">
            Need assistance? Create support ticket and our teams will get back
            to you promptly.
          </p>
        </Box>
      </Flex>

      <Flex className="justify-between max-md:flex-col max-md:items-start rounded-none bg-transparent border-b-2 border-gray-200 py-8 mt-10">
        <Box>
          <h1 className="text-md font-medium capitalize">Your Tickets</h1>
          <p className="text-gray-500 mt-0 max-md:text-sm">
            {ticketsData?.data?.tickets?.length === 0
              ? "You have no tickets assigned to you yet!"
              : `You have ${
                  ticketsData?.data?.tickets?.length || 0
                } ticket(s) assigned to you`}
          </p>
        </Box>

        {/* Hide create button for viewers - they can only view assigned tickets */}
        {user?.user.role !== "viewer" && (
          <Button
            variant="outline"
            className="bg-black text-white border border-gray-200  rounded-full px-6 py-5 flex items-center gap-2 cursor-pointer h-11"
            onClick={() => modalProps.onOpenChange(true)}
          >
            Create Ticket
          </Button>
        )}
      </Flex>

      <Flex className="justify-between max-md:flex-col max-md:items-start bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200 mt-5">
        <Box className="flex-1">
          <Flex className="items-center gap-3 mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <h1 className="text-lg font-semibold text-gray-800">
              Your Ticket Notifications
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
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to clear all notifications?"
                      )
                    ) {
                      clearAllNotificationsMutation.mutate(undefined, {
                        onSuccess: () => {
                          toast.success("All notifications cleared");
                        },
                        onError: () => {
                          toast.error("Failed to clear notifications");
                        },
                      });
                    }
                  }}
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
                      onClick={() => {
                        // Mark as read if not already read
                        if (!notification.read) {
                          markAsReadMutation.mutate(notification.id);
                        }

                        // Navigate to support tickets page for support ticket notifications
                        if (notification.type.includes("support_ticket")) {
                          navigate("/dashboard/viewer-support");
                        }
                      }}
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

          {(!notificationsData?.data?.notifications ||
            notificationsData.data.notifications.length === 0) && (
            <p className="text-gray-500 text-sm mt-2">
              No notifications to show
            </p>
          )}
        </Box>
      </Flex>

      <Flex className="flex-col items-start bg-transparent w-full mt-5">
        <Box>
          <h1 className="text-lg font-medium capitalize">Recent Tickets</h1>
        </Box>

        <Accordion
          type="single"
          collapsible
          className="w-full"
          defaultValue="item-0"
        >
          {ticketsData?.data?.tickets?.length === 0 ? (
            <Box className="bg-blue-50 border border-blue-200 rounded-md p-6 text-center">
              <p className="text-blue-800 text-lg font-medium mb-2">
                No tickets assigned to you yet
              </p>
              <p className="text-blue-600 text-sm">
                When team members create support tickets and assign them to you,
                they will appear here.
              </p>
            </Box>
          ) : (
            ticketsData?.data?.tickets?.map((ticket, index) => (
              <AccordionItem key={ticket.id} value={`item-${index}`}>
                <AccordionTrigger className="cursor-pointer">
                  <Stack>
                    <h1 className="font-normal hover:underline text-[18px] cursor-pointer">
                      {ticket.subject}
                    </h1>
                    <p className="text-[#797979] text-sm font-normal">
                      Posted on{" "}
                      {new Date(ticket.createdon).toLocaleDateString()}
                    </p>
                  </Stack>
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-4 text-balance capitalize">
                  <p>{ticket.description}</p>
                  <p className="text-sm text-gray-600">
                    Priority: {ticket.priority} | Status: {ticket.status}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))
          )}
        </Accordion>
      </Flex>

      <GeneralModal {...modalProps}>
        <h2 className="text-lg font-normal mb-4">Create Ticket</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Box className="bg-white/80 gap-4 grid grid-cols-1">
              <FormField
                control={form.control}
                name="clientname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white rounded-full placeholder:text-gray-400"
                        size="lg"
                        type="text"
                        placeholder="Enter your name"
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        className="bg-white rounded-md placeholder:text-gray-400"
                        maxLength={100}
                        placeholder="Enter your description"
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
              >
                Create
              </Button>
            </Box>
          </form>
        </Form>
      </GeneralModal>
    </ComponentWrapper>
  );
};
