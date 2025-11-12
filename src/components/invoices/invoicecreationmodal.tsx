import React, { useState } from "react";
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
import { useFetchClients } from "@/hooks/usefetchclients";
import { Upload, FileText, X } from "lucide-react";
import { toast } from "sonner";
import { GeneralModal } from "../common/generalmodal";

const formSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  description: z.string().optional(),
  dueDate: z.string().optional(),
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
    },
  });

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
      let pdfBase64 = undefined;
      let pdfFileName = undefined;

      if (pdfFile) {
        // Convert PDF to base64
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          pdfBase64 = base64; // Keep the full data URL format
          pdfFileName = pdfFile.name;

          // Submit with PDF data
          createInvoiceMutation.mutate(
            {
              ...data,
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
        // Submit without PDF
        createInvoiceMutation.mutate(data, {
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

  return (
    <GeneralModal
      open={isOpen}
      onOpenChange={handleClose}
      contentProps={{ className: "h-[600px] overflow-y-auto" }}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Client Selection */}
        <Box className="w-full">
          <label className="text-sm font-medium text-gray-700">Client *</label>
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
        {/* Due Date */}
        <Box className="">
          <label className="block text-sm font-medium text-gray-700">
            Due Date
          </label>
          <Input type="date" {...register("dueDate")} />
          {errors.dueDate && (
            <p className="text-red-500 text-sm mt-1">
              {errors.dueDate.message}
            </p>
          )}
        </Box>
        {/* Amount */}
        <Box>
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
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

        {/* PDF Upload */}
        <Box>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Attach PDF (Optional)
          </label>

          {!pdfFile ? (
            <Box className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="pdf-upload"
              />
              <label htmlFor="pdf-upload" className="cursor-pointer">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  Click to upload PDF or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PDF files only, max 10MB
                </p>
              </label>
            </Box>
          ) : (
            <Box className="border border-gray-200 rounded-lg p-4">
              <Flex className="items-center justify-between">
                <Flex className="items-center space-x-3">
                  <FileText className="h-8 w-8 text-red-500" />
                  <Box>
                    <p className="text-sm font-medium text-gray-900">
                      {pdfFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </Box>
                </Flex>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removePdfFile}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              </Flex>
            </Box>
          )}
        </Box>

        {/* Action Buttons */}
        <Flex className="justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={createInvoiceMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createInvoiceMutation.isPending}
            className="bg-[#1797b9] hover:bg-[#1797b9]/90"
          >
            {createInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
          </Button>
        </Flex>
      </form>
    </GeneralModal>
  );
};
