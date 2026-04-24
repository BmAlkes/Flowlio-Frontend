import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { useCreateInvoice } from "@/hooks/usecreateinvoice";
import { useCreateRecurringInvoice } from "@/hooks/usecreaterecurringinvoice";
import { useFetchClients } from "@/hooks/usefetchclients";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { GeneralModal } from "../common/generalmodal";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  isRecurring: z.boolean().default(false),
  templateName: z.string().optional(),
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
}).refine(data => {
  if (data.isRecurring) {
    return !!data.templateName && !!data.frequency && !!data.startDate;
  }
  return true;
}, {
  message: "Required fields for recurring invoice are missing",
  path: ["templateName"]
});

type FormData = z.infer<typeof formSchema>;

interface InvoiceCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceCreationModal: React.FC<InvoiceCreationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const createInvoiceMutation = useCreateInvoice();
  const createRecurringMutation = useCreateRecurringInvoice();
  const { data: clientsData } = useFetchClients();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: "",
      amount: 0,
      description: "",
      dueDate: "",
      isRecurring: false,
      frequency: "monthly",
    },
  });

  const isRecurring = watch("isRecurring");

  // Reset recurring fields when toggled off
  useEffect(() => {
    if (!isRecurring) {
      setValue("templateName", "");
      setValue("startDate", "");
      setValue("endDate", "");
    } else {
      // Set default start date to today if recurring is turned on
      const today = new Date().toISOString().split('T')[0];
      setValue("startDate", today);
    }
  }, [isRecurring, setValue]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (
      file &&
      file.type === "application/pdf" &&
      file.size <= 10 * 1024 * 1024 // 10MB
    ) {
      setPdfFile(file);
    } else {
      toast.error("Please select a valid PDF file (max 10MB)");
    }
  };

  const removePdfFile = () => {
    setPdfFile(null);
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (data.isRecurring) {
        // Handle Recurring Template Creation
        createRecurringMutation.mutate({
          templateName: data.templateName!,
          clientId: data.clientId,
          amount: data.amount,
          description: data.description,
          frequency: data.frequency!,
          startDate: data.startDate!,
          endDate: data.endDate || undefined,
        }, {
          onSuccess: () => {
            reset();
            onClose();
          }
        });
        return;
      }

      // Handle One-time Invoice Creation
      let pdfBase64 = undefined;
      let pdfFileName = undefined;

      if (pdfFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          pdfBase64 = base64;
          pdfFileName = pdfFile.name;

          createInvoiceMutation.mutate(
            {
              clientId: data.clientId,
              amount: data.amount,
              description: data.description,
              dueDate: data.dueDate,
              pdfFile: pdfBase64,
              pdfFileName: pdfFileName,
            },
            {
              onSuccess: () => {
                reset();
                setPdfFile(null);
                onClose();
              },
            }
          );
        };
        reader.readAsDataURL(pdfFile);
      } else {
        createInvoiceMutation.mutate({
          clientId: data.clientId,
          amount: data.amount,
          description: data.description,
          dueDate: data.dueDate,
        }, {
          onSuccess: () => {
            reset();
            onClose();
          },
        });
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
    }
  };

  const handleClose = () => {
    reset();
    setPdfFile(null);
    onClose();
  };

  const isPending = createInvoiceMutation.isPending || createRecurringMutation.isPending;

  return (
    <GeneralModal
      open={isOpen}
      onOpenChange={handleClose}
      contentProps={{ className: "h-[650px] overflow-y-auto" }}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Flex className="items-center justify-between bg-muted/50 p-4 rounded-lg border border-border">
          <Box className="space-y-0.5">
            <Label className="text-sm font-semibold text-foreground">Make Recurring</Label>
            <p className="text-xs text-muted-foreground">Automatically generate invoices at intervals</p>
          </Box>
          <Switch 
            checked={isRecurring}
            onCheckedChange={(checked) => setValue("isRecurring", checked)}
          />
        </Flex>

        {isRecurring && (
          <Box className="space-y-4 p-4 border border-primary/20 bg-primary/5 rounded-lg animate-in fade-in slide-in-from-top-2">
            <Box className="w-full">
              <label className="text-sm font-medium text-foreground">Template Name *</label>
              <Input 
                placeholder="e.g. Monthly Maintenance Fee"
                {...register("templateName")}
              />
              {errors.templateName && (
                <p className="text-red-500 text-sm mt-1">{errors.templateName.message}</p>
              )}
            </Box>

            <Flex className="gap-4 max-sm:flex-col">
              <Box className="flex-1">
                <label className="text-sm font-medium text-foreground">Frequency *</label>
                <Select
                  value={watch("frequency")}
                  onValueChange={(value) => setValue("frequency", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </Box>
              <Box className="flex-1">
                <label className="text-sm font-medium text-foreground">Start Date *</label>
                <Input type="date" {...register("startDate")} />
                {errors.startDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>
                )}
              </Box>
            </Flex>
          </Box>
        )}
        {/* Client Selection */}
        <Box className="w-full">
          <label className="text-sm font-medium text-foreground">Client *</label>
          <Select
            value={watch("clientId")}
            onValueChange={(value) => setValue("clientId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              {clientsData?.data?.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.clientId && (
            <p className="text-red-500 text-sm mt-1">
              {errors.clientId.message}
            </p>
          )}
        </Box>
        {!isRecurring && (
          <Box className="">
            <label className="block text-sm font-medium text-foreground">
              Due Date
            </label>
            <Input type="date" {...register("dueDate")} />
            {errors.dueDate && (
              <p className="text-red-500 text-sm mt-1">
                {errors.dueDate.message}
              </p>
            )}
          </Box>
        )}
        {/* Amount */}
        <Box>
          <label className="block text-sm font-medium text-foreground mb-2">
            Amount *
          </label>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            {...register("amount", { valueAsNumber: true })}
            placeholder="Enter amount"
          />
          {errors.amount && (
            <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
          )}
        </Box>

        {/* Description */}
        <Box>
          <label className="block text-sm font-medium text-foreground mb-2">
            Description
          </label>
          <Textarea
            {...register("description")}
            placeholder="Enter invoice description"
            rows={3}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </Box>

        {!isRecurring && (
          <Box>
            <label className="block text-sm font-medium text-foreground mb-2">
              Attach PDF (Optional)
            </label>

            {!pdfFile ? (
              <Box className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="pdf-upload"
                />
                <label htmlFor="pdf-upload" className="cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Click to upload PDF or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF files only, max 10MB
                  </p>
                </label>
              </Box>
            ) : (
              <Box className="border border-border rounded-lg p-4">
                <Flex className="items-center justify-between">
                  <Flex className="items-center space-x-3">
                    <FileText className="h-8 w-8 text-red-500" />
                    <Box>
                      <p className="text-sm font-medium text-foreground">
                        {pdfFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </Box>
                  </Flex>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removePdfFile}
                    className="text-muted-foreground hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </Flex>
              </Box>
            )}
          </Box>
        )}

        <Flex className="justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            variant="default"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : isRecurring ? (
              "Create Template"
            ) : (
              "Create Invoice"
            )}
          </Button>
        </Flex>
      </form>
    </GeneralModal>
  );
};
