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
  useAssignmentOptions,
  type CreateUniversalSupportTicketRequest,
} from "@/hooks/useUniversalSupportTickets";
import { toast } from "sonner";
import { useState } from "react";
import { useUser } from "@/providers/user.provider";

const formSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  client: z.string().optional(),
  assignedTo: z.string().optional(),
  assignedToOrganization: z.string().optional(),
  assignedToUser: z.string().optional(),
});

interface UniversalSupportTicketProps {
  title?: string;
  description?: string;
}

export const UniversalSupportTicket: FC<UniversalSupportTicketProps> = ({
  title = "Support Tickets",
  description = "Manage and resolve customer issues quickly and efficiently.",
}) => {
  const [assignmentType, setAssignmentType] = useState<
    "organization" | "user" | "none"
  >("none");

  const { data: user } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      description: "",
      priority: "medium",
      client: "",
      assignedTo: "",
      assignedToOrganization: "",
      assignedToUser: "",
    },
  });

  const createSupportTicketMutation = useCreateUniversalSupportTicket();
  const modalProps = useGeneralModalDisclosure();
  const [page, setPage] = useState(1);
  const limit = 20;
  const { data, isLoading, error, refetch } = useUniversalSupportTickets({
    page,
    limit,
  });
  const { mutate: deleteSupportTicket } = useDeleteUniversalSupportTicket();
  const { data: assignmentOptions } = useAssignmentOptions();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const ticketData: CreateUniversalSupportTicketRequest = {
        subject: values.subject,
        description: values.description,
        priority: values.priority,
        client: values.client,
        assignedToUser: values.assignedTo, // Map assignedTo to assignedToUser
        assignedToOrganization: values.assignedToOrganization,
      };

      await createSupportTicketMutation.mutateAsync(ticketData);
      form.reset();
      setAssignmentType("none");
      modalProps.onOpenChange(false);
      refetch();
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast.error("Failed to create support ticket");
    }
  }

  // Determine if user can assign to organizations (superadmin only)
  const canAssignToOrganizations = user?.user.role === "superadmin";

  // Determine if user can assign to specific users
  const canAssignToUsers =
    user?.user.role === "superadmin" || user?.user.role === "subadmin";

  return (
    <PageWrapper className="mt-6">
      <Center className="justify-between px-4 py-6 max-sm:flex-col max-sm:items-start gap-2">
        <Stack className="gap-1">
          <h1 className="text-black text-2xl max-sm:text-xl font-medium">
            {title}
          </h1>
          <h1 className={`max-sm:text-sm max-w-[600px] text-gray-500`}>
            {description}
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
        pagination={data?.data?.pagination}
        onPageChange={setPage}
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

      <GeneralModal
        {...modalProps}
        contentProps={{
          className:
            "max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw]",
        }}
      >
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

              {/* Assignment Type Selection - Only show if user has assignment permissions */}
              {(canAssignToOrganizations || canAssignToUsers) && (
                <FormItem>
                  <FormLabel>Assignment Type</FormLabel>
                  <Select
                    value={assignmentType}
                    onValueChange={(
                      value: "organization" | "user" | "none"
                    ) => {
                      setAssignmentType(value);
                      form.setValue("assignedToOrganization", "");
                      form.setValue("assignedToUser", "");
                      form.setValue("assignedTo", "");
                    }}
                  >
                    <FormControl className="w-full h-12">
                      <SelectTrigger
                        size="lg"
                        className="bg-gray-100 border border-gray-200 rounded-full w-full h-12 placeholder:text-gray-100"
                      >
                        <SelectValue placeholder="Select Assignment Type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="w-full">
                      <SelectItem value="none">No Assignment</SelectItem>
                      {canAssignToOrganizations && (
                        <SelectItem value="organization">
                          Assign to Organization
                        </SelectItem>
                      )}
                      {canAssignToUsers && (
                        <SelectItem value="user">
                          Assign to Specific User
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}

              {/* Organization Assignment - Only for superadmin */}
              {assignmentType === "organization" &&
                canAssignToOrganizations && (
                  <FormField
                    control={form.control}
                    name="assignedToOrganization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Organization</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl className="w-full h-12">
                            <SelectTrigger
                              size="lg"
                              className="bg-gray-100 border border-gray-200 rounded-full w-full h-12 placeholder:text-gray-100"
                            >
                              <SelectValue placeholder="Select Organization" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="w-full">
                            {assignmentOptions?.data?.organizations?.map(
                              (org) => (
                                <SelectItem key={org.id} value={org.id}>
                                  {org.name}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

              {/* User Assignment - For superadmin and subadmin */}
              {assignmentType === "user" && canAssignToUsers && (
                <FormField
                  control={form.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select User</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl className="w-full h-12">
                          <SelectTrigger
                            size="lg"
                            className="bg-gray-100 border border-gray-200 rounded-full w-full h-12 placeholder:text-gray-100"
                          >
                            <SelectValue placeholder="Select User" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="w-full">
                          {assignmentOptions?.data?.users?.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} ({user.email}) - {user.role} -{" "}
                              {user.organization?.name || "No Organization"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

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
