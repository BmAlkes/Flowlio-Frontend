import { FC } from "react";
import { PageWrapper } from "../common/pagewrapper";
import { PaymentLinksTable } from "./paymentlinkstable";
import { Center } from "../ui/center";
import { Stack } from "../ui/stack";
import { Button } from "../ui/button";
import { CirclePlus } from "lucide-react";
import {
  GeneralModal,
  useGeneralModalDisclosure,
} from "../common/generalmodal";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box } from "../ui/box";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Form } from "../ui/form"; // or "@/components/ui/form"
import { useForm } from "react-hook-form";
import { Textarea } from "../ui/textarea";
import { useCreatePaymentLink } from "@/hooks/usecreatepaymentlink";
import { useFetchClients } from "@/hooks/usefetchclients";
import { useFetchProjects } from "@/hooks/usefetchprojects";

const formSchema = z.object({
  clientId: z.string().min(1, {
    message: "Client is required.",
  }),
  projectId: z.string().min(1, {
    message: "Project is required.",
  }),
  amount: z.number().min(0.01, {
    message: "Amount must be greater than 0.",
  }),
  description: z.string().min(1, {
    message: "Description is required",
  }),
});
const PaymentLinksHeader: FC = () => {
  const createPaymentLinkMutation = useCreatePaymentLink();
  const { data: clientsData } = useFetchClients();
  const { data: projectsData } = useFetchProjects();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: "",
      projectId: "",
      amount: 0,
      description: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createPaymentLinkMutation.mutate(values, {
      onSuccess: () => {
        form.reset();
        modalProps.onOpenChange(false);
      },
    });
  }

  const modalProps = useGeneralModalDisclosure();

  return (
    <PageWrapper className="mt-6">
      <Center className="justify-between px-4 py-6 max-sm:flex-col max-sm:items-start gap-2">
        <Stack className="gap-1">
          <h1 className="text-black text-2xl max-sm:text-xl font-medium">
            Payment Links
          </h1>
          <h1 className={`max-sm:text-sm max-w-[600px] text-gray-500`}>
            Simplify Transactions with Instant Payment Links
          </h1>
        </Stack>

        <Button
          onClick={() => modalProps.onOpenChange(true)}
          variant="outline"
          className="bg-black text-white border border-gray-200  rounded-full px-6 py-5 flex items-center gap-2 cursor-pointer"
        >
          <CirclePlus className="fill-white text-black size-5" />
          Create Links
        </Button>
      </Center>

      <PaymentLinksTable />

      <GeneralModal {...modalProps}>
        <h2 className="text-lg font-normal mb-4">Create Payment Link</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Box className="bg-white/80 gap-4 grid grid-cols-1">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl className="w-full h-12">
                        <SelectTrigger
                          size="lg"
                          className="bg-gray-100 border border-gray-200 rounded-full w-full h-12 placeholder:text-gray-100"
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl className="w-full h-12">
                        <SelectTrigger
                          size="lg"
                          className="bg-gray-100 border border-gray-200 rounded-full w-full h-12 placeholder:text-gray-100"
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
                        className="bg-white rounded-full placeholder:text-gray-400"
                        size="lg"
                        type="number"
                        step="0.01"
                        placeholder="$ 0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
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
                        className="bg-white rounded-xl placeholder:text-gray-400 h-32"
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

              <Button
                variant="outline"
                className="bg-[#1797b9] hover:bg-[#1797b9]/80 hover:text-white text-white border border-gray-200 rounded-full px-6 py-5 flex items-center gap-2 cursor-pointer"
                type="submit"
                disabled={createPaymentLinkMutation.isPending}
              >
                {createPaymentLinkMutation.isPending ? "Creating..." : "Save"}
              </Button>
            </Box>
          </form>
        </Form>
      </GeneralModal>
    </PageWrapper>
  );
};

export { PaymentLinksHeader };
