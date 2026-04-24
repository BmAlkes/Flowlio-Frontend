import { FC, useState } from "react";
import { PageWrapper } from "@/components/common/pagewrapper";
import { Stack } from "@/components/ui/stack";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
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
import { useUser } from "@/providers/user.provider";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
  const [page, setPage] = useState(1);
  const limit = 20;

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

  const { data, isLoading, isFetching, error, refetch } =
    useUniversalSupportTickets({
      page,
      limit,
    });

  const createSupportTicketMutation = useCreateUniversalSupportTicket();
  const { mutate: deleteSupportTicket } = useDeleteUniversalSupportTicket();
  const { data: assignmentOptions } = useAssignmentOptions();
  const createModalProps = useGeneralModalDisclosure();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const ticketData: CreateUniversalSupportTicketRequest = {
        subject: values.subject,
        description: values.description,
        priority: values.priority,
        client: values.client,
        assignedToUser: values.assignedTo,
        assignedToOrganization: values.assignedToOrganization,
      };

      await createSupportTicketMutation.mutateAsync(ticketData);
      form.reset();
      setAssignmentType("none");
      createModalProps.onOpenChange(false);
      refetch();
      toast.success("Support ticket created successfully");
    } catch (error) {
      toast.error("Failed to create support ticket");
    }
  }

  const canAssignToOrganizations = user?.user.role === "superadmin";
  const canAssignToUsers =
    user?.user.role === "superadmin" || user?.user.role === "subadmin";

  return (
    <PageWrapper className="mt-6 pb-24">
      {/* Header Section */}
      <Flex className="justify-between items-end mb-10 border-b border-border pb-8 px-4">
        <Stack className="gap-2">
          <Badge className="w-fit mt-3 bg-blue-100 text-blue-600 border-none px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-1">
            Administration
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-muted-foreground text-sm max-w-xl">
            {description}
          </p>
        </Stack>

        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-8 h-14 font-black shadow-xl shadow-blue-500/30 flex items-center gap-3 transition-transform active:scale-95"
          onClick={() => createModalProps.onOpenChange(true)}
        >
          <Plus className="size-5" />
          Create New Ticket
        </Button>
      </Flex>

      {/* Main Table Content */}
      <Box className="px-4">
        <SupportTicketTable
          data={data?.data?.tickets || []}
          isLoading={isLoading}
          isFetching={isFetching}
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
                  refetch();
                },
                onError: (error: any) => {
                  toast.error(
                    error.response?.data?.message ||
                      "Failed to delete support ticket",
                  );
                },
              },
            )
          }
        />
      </Box>

      {/* Creation Flow Modal */}
      <GeneralModal
        {...createModalProps}
        contentProps={{ className: "max-w-2xl rounded-[2.5rem] p-6" }}
      >
        <Stack className="gap-1 mb-5 border-b border-border pb-4">
          <Badge className="w-fit bg-blue-100 text-blue-600 border-none px-3 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase">
            Admin Flow
          </Badge>
          <h2 className="text-3xl font-black text-foreground tracking-tight">
            Create Support Ticket
          </h2>
        </Stack>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-widest text-foreground/70">
                    Subject
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="h-12 rounded-2xl border-border bg-muted/20 focus:bg-white focus:ring-blue-500 transition-all font-medium"
                      placeholder="Brief summary of the request"
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
                  <FormLabel className="text-xs font-bold uppercase tracking-widest text-foreground/70">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[110px] rounded-3xl border-border bg-muted/20 focus:bg-white focus:ring-blue-500 transition-all p-4 font-medium leading-relaxed"
                      placeholder="Detailed description..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-foreground/70">
                      Priority
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-2xl border-border">
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
                name="client"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-foreground/70">
                      Client (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="h-12 rounded-2xl border-border"
                        placeholder="External client name"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {(canAssignToOrganizations || canAssignToUsers) && (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase tracking-widest text-foreground/70">
                  Assignment Type
                </FormLabel>
                <Select
                  value={assignmentType}
                  onValueChange={(value: "organization" | "user" | "none") => {
                    setAssignmentType(value);
                    form.setValue("assignedToOrganization", "");
                    form.setValue("assignedToUser", "");
                    form.setValue("assignedTo", "");
                  }}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 rounded-2xl border-border bg-blue-50/30 border-blue-100">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">No Assignment</SelectItem>
                    {canAssignToOrganizations && (
                      <SelectItem value="organization">
                        Organization Wide
                      </SelectItem>
                    )}
                    {canAssignToUsers && (
                      <SelectItem value="user">Specific Recipient</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </FormItem>
            )}

            {assignmentType === "organization" && (
              <FormField
                control={form.control}
                name="assignedToOrganization"
                render={({ field }) => (
                  <FormItem className="animate-in fade-in slide-in-from-top-2">
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-foreground/70">
                      Select Organization
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-2xl border-border">
                          <SelectValue placeholder="Organization name" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {assignmentOptions?.data?.organizations?.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            )}

            {assignmentType === "user" && (
              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem className="animate-in fade-in slide-in-from-top-2">
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-foreground/70">
                      Select Recipient
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-2xl border-border">
                          <SelectValue placeholder="Recipient name" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {assignmentOptions?.data?.users?.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name} ({u.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            )}

            <Flex className="justify-end gap-3 pt-4 border-t border-border mt-6">
              <Button
                type="button"
                variant="ghost"
                className="rounded-2xl px-8 h-12 font-bold text-muted-foreground"
                onClick={() => createModalProps.onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-12 h-12 font-black shadow-xl shadow-blue-500/20 transition-all active:scale-95"
                disabled={createSupportTicketMutation.isPending}
              >
                {createSupportTicketMutation.isPending ? (
                  <Loader2 className="animate-spin size-5" />
                ) : (
                  "Launch Ticket"
                )}
              </Button>
            </Flex>
          </form>
        </Form>
      </GeneralModal>
    </PageWrapper>
  );
};
