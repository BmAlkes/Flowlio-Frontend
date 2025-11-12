import { FC } from "react";
import { PageWrapper } from "@/components/common/pagewrapper";
import { Center } from "@/components/ui/center";
import { Stack } from "@/components/ui/stack";
import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";
import {
  GeneralModal,
  useGeneralModalDisclosure,
} from "@/components/common/generalmodal";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box } from "@/components/ui/box";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { SupportTicketTable } from "@/components/super admin section/support tickets/supportticketstable";
import { Flex } from "@/components/ui/flex";
import {
  useCreateUniversalSupportTicket,
  useUniversalSupportTickets,
  useDeleteUniversalSupportTicket,
  type CreateUniversalSupportTicketRequest,
} from "@/hooks/useUniversalSupportTickets";
import { toast } from "sonner";

const formSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.enum(["high", "medium", "low", "urgent"]),
  client: z.string().optional(),
});

export const UserSupportTickets: FC = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      description: "",
      priority: "medium",
      client: "",
    },
  });

  const createSupportTicketMutation = useCreateUniversalSupportTicket();
  const modalProps = useGeneralModalDisclosure();
  const { data, isLoading, error, refetch } = useUniversalSupportTickets();
  const { mutate: deleteSupportTicket } = useDeleteUniversalSupportTicket();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const ticketData: CreateUniversalSupportTicketRequest = {
        subject: values.subject,
        description: values.description,
        priority: values.priority,
        client: values.client,
        // No assignment options for regular users
      };

      await createSupportTicketMutation.mutateAsync(ticketData);
      form.reset();
      modalProps.onOpenChange(false);
      refetch();
    } catch {
      toast.error("Failed to create support ticket");
    }
  }

  return (
    <PageWrapper className="mt-6">
      <Center className="justify-between px-4 py-6 max-sm:flex-col max-sm:items-start gap-2">
        <Stack className="gap-1">
          <h1 className="text-black text-2xl max-sm:text-xl font-medium">
            My Support Tickets
          </h1>
          <h1 className={`max-sm:text-sm max-w-[600px] text-gray-500`}>
            Create and track your support requests. Your organization will be
            notified automatically.
          </h1>
        </Stack>

        <Button
          onClick={() => modalProps.onOpenChange(true)}
          variant="outline"
          className="bg-black text-white border border-gray-200 rounded-full px-6 py-5 flex items-center gap-2 cursor-pointer"
        >
          <CirclePlus className="fill-white text-black size-5" />
          Create New Ticket
        </Button>
      </Center>

      <SupportTicketTable
        data={data?.data?.tickets || []}
        isLoading={isLoading}
        error={error}
        refetch={refetch}
        deleteSupportTicket={(id) =>
          deleteSupportTicket(
            { id },
            {
              onSuccess: () => {
                toast.success("Support Ticket deleted successfully");
              },
              onError: (error) => {
                toast.error(
                  error.response?.data?.message ||
                    "Failed to delete support ticket"
                );
              },
            }
          )
        }
      />

      <GeneralModal {...modalProps}>
        <h2 className="text-lg font-normal mb-4">Create Support Ticket</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Box className="bg-white/80 gap-4 grid grid-cols-1">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl className="w-full h-12">
                      <input
                        {...field}
                        className="bg-gray-100 border border-gray-200 rounded-full w-full h-12 px-4 placeholder:text-gray-500"
                        placeholder="Enter ticket subject"
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
                    <FormControl className="w-full">
                      <textarea
                        {...field}
                        className="bg-gray-100 border border-gray-200 rounded-lg w-full p-4 min-h-[50px] resize-none placeholder:text-gray-500"
                        placeholder="Describe the issue in detail..."
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
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl className="w-full h-12">
                        <SelectTrigger
                          size="lg"
                          className="bg-gray-100 border border-gray-200 rounded-full w-full h-12 placeholder:text-gray-100"
                        >
                          <SelectValue placeholder="Select Priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="w-full">
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <FormControl className="w-full h-12">
                      <input
                        {...field}
                        className="bg-gray-100 border border-gray-200 rounded-full w-full h-12 px-4 placeholder:text-gray-500"
                        placeholder="Enter client name (optional)"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Flex className="justify-end">
                <Button
                  variant="outline"
                  className="bg-[#1797b9]/30 hover:bg-[#1797b9]/80 hover:text-white text-black border border-gray-200 font-normal rounded-full px-6 py-5 flex items-center gap-2 cursor-pointer"
                  type="button"
                  onClick={() => modalProps.onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  className="bg-[#1797b9] hover:bg-[#1797b9]/80 hover:text-white text-white border border-gray-200 rounded-full px-6 py-5 flex items-center gap-2 cursor-pointer"
                  type="submit"
                  disabled={createSupportTicketMutation.isPending}
                >
                  {createSupportTicketMutation.isPending
                    ? "Creating..."
                    : "Create Ticket"}
                </Button>
              </Flex>
            </Box>
          </form>
        </Form>
      </GeneralModal>
    </PageWrapper>
  );
};
