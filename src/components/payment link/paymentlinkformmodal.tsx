import { FC, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  GeneralModal,
  type GeneralModalReturnTypeProps,
} from "../common/generalmodal";
import { Box } from "../ui/box";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Form,
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
} from "../ui/select";
import { useCreatePaymentLink } from "@/hooks/usecreatepaymentlink";
import { useUpdatePaymentLink } from "@/hooks/useupdatepaymentlink";
import { useFetchClients } from "@/hooks/usefetchclients";
import { useFetchProjects } from "@/hooks/usefetchprojects";
import { PaymentLink } from "@/hooks/usefetchpaymentlinks";

const formSchema = z.object({
  clientId: z.string().min(1, { message: "Client is required." }),
  projectId: z.string().min(1, { message: "Project is required." }),
  amount: z.number().min(0.01, { message: "Amount must be greater than 0." }),
  description: z.string().min(1, { message: "Description is required" }),
  externalPaymentUrl: z
    .string()
    .min(1, { message: "Payment URL is required." })
    .url({ message: "Must be a valid URL (e.g. your Stripe Payment Link or PayPal.me)." })
    .refine((v) => v.startsWith("https://"), { message: "Payment URL must start with https://" }),
});

type FormValues = z.infer<typeof formSchema>;

interface PaymentLinkFormModalProps {
  modalProps: GeneralModalReturnTypeProps;
  existing?: PaymentLink | null;
}

export const PaymentLinkFormModal: FC<PaymentLinkFormModalProps> = ({
  modalProps,
  existing,
}) => {
  const isEditing = !!existing;
  const createPaymentLinkMutation = useCreatePaymentLink();
  const updatePaymentLinkMutation = useUpdatePaymentLink();
  const { data: clientsData } = useFetchClients();
  const { data: projectsData } = useFetchProjects();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: "",
      projectId: "",
      amount: 0,
      description: "",
      externalPaymentUrl: "",
    },
  });

  useEffect(() => {
    if (existing) {
      form.reset({
        clientId: existing.clientId,
        projectId: existing.projectId,
        amount: parseFloat(existing.amount),
        description: existing.description,
        externalPaymentUrl: existing.externalPaymentUrl ?? "",
      });
    } else {
      form.reset({
        clientId: "",
        projectId: "",
        amount: 0,
        description: "",
        externalPaymentUrl: "",
      });
    }
  }, [existing, modalProps.open]);

  const isPending = createPaymentLinkMutation.isPending || updatePaymentLinkMutation.isPending;

  function onSubmit(values: FormValues) {
    if (isEditing && existing) {
      updatePaymentLinkMutation.mutate(
        { id: existing.id, data: values },
        { onSuccess: () => modalProps.onOpenChange(false) },
      );
    } else {
      createPaymentLinkMutation.mutate(values, {
        onSuccess: () => {
          form.reset();
          modalProps.onOpenChange(false);
        },
      });
    }
  }

  return (
    <GeneralModal {...modalProps}>
      <h2 className="text-lg font-normal mb-4">
        {isEditing ? "Edit Payment Link" : "Create Payment Link"}
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Box className="bg-card/80 gap-4 grid grid-cols-1">
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl className="w-full h-12">
                      <SelectTrigger
                        size="lg"
                        className="bg-muted border border-border rounded-full w-full h-12 placeholder:text-gray-100"
                      >
                        <SelectValue placeholder="Select Client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="w-full">
                      {clientsData?.data?.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl className="w-full h-12">
                      <SelectTrigger
                        size="lg"
                        className="bg-muted border border-border rounded-full w-full h-12 placeholder:text-gray-100"
                      >
                        <SelectValue placeholder="Select Project" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="w-full">
                      {projectsData?.data?.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.projectName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-background rounded-full placeholder:text-muted-foreground"
                      size="lg"
                      type="number"
                      step="0.01"
                      placeholder="$ 0"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                      className="bg-card rounded-xl placeholder:text-muted-foreground h-32"
                      rows={4}
                      cols={50}
                      placeholder="Briefly describe the purpose of this payment link"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="externalPaymentUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment URL</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-background rounded-full placeholder:text-muted-foreground"
                      size="lg"
                      type="url"
                      placeholder="https://buy.stripe.com/... or https://paypal.me/..."
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground/90">
                    Paste a payment link from your own Stripe, PayPal, or Wise account — Flowlio doesn't process payments, it just shares this link with your client.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              variant="outline"
              className="bg-[#1797b9] hover:bg-[#1797b9]/80 hover:text-white text-white border border-border rounded-full px-6 py-5 flex items-center gap-2 cursor-pointer"
              type="submit"
              disabled={isPending}
            >
              {isPending ? "Saving..." : isEditing ? "Save Changes" : "Save"}
            </Button>
          </Box>
        </form>
      </Form>
    </GeneralModal>
  );
};
