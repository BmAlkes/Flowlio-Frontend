import { FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GeneralModal } from "@/components/common/generalmodal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Flex } from "@/components/ui/flex";
import { useSendNewsletter } from "@/hooks/usesendnewsletter";
import { toast } from "sonner";

const newsletterSchema = z.object({
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(200, "Subject must be less than 200 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

interface SendNewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SendNewsletterModal: FC<SendNewsletterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const form = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      subject: "",
      content: "",
    },
  });

  const sendNewsletterMutation = useSendNewsletter();

  const onSubmit = async (data: NewsletterFormData) => {
    console.log("[Newsletter Modal] Form submitted:", {
      subject: data.subject,
      contentLength: data.content.length,
      timestamp: new Date().toISOString(),
    });

    try {
      const result = await sendNewsletterMutation.mutateAsync(data);

      console.log("[Newsletter Modal] Response received:", result);

      if (result.data?.successful) {
        const successMessage = `Newsletter sent successfully to ${
          result.data?.successful || 0
        } subscribers!`;
        console.log("[Newsletter Modal] Success:", successMessage);

        if (result.data?.failed && result.data.failed > 0) {
          console.warn(
            `[Newsletter Modal] Some emails failed: ${result.data.failed} out of ${result.data.total}`
          );
          console.warn(
            "[Newsletter Modal] Failed emails:",
            result.data.results?.filter((r) => !r.success)
          );

          toast.error(`${successMessage} (${result.data.failed} failed)`);
        } else {
          toast.success(successMessage);
        }

        form.reset();
        onClose();
      } else {
        const errorMessage = result.message || "Failed to send newsletter";
        console.error("[Newsletter Modal] Failed:", errorMessage, result);
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to send newsletter. Please try again.";

      console.error("[Newsletter Modal] Error caught:", {
        error,
        message: errorMessage,
        response: error?.response?.data,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data?.data,
        fullError: error,
      });

      // Show detailed error if available
      if (error?.response?.data?.data) {
        const errorData = error.response.data.data;
        if (errorData.results && errorData.results.length > 0) {
          const failedEmails = errorData.results
            .filter((r: any) => !r.success)
            .map((r: any) => `${r.email}: ${r.error || "Unknown error"}`);
          console.error(
            "[Newsletter Modal] Failed email details:",
            failedEmails
          );
        }
      }

      toast.error(errorMessage);
    }
  };

  return (
    <GeneralModal
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          form.reset();
          onClose();
        }
      }}
      contentProps={{
        className:
          "max-w-3xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw]",
      }}
    >
      <h2 className="text-lg font-normal mb-4">Send Newsletter</h2>
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
                      placeholder="Enter newsletter subject"
                      disabled={sendNewsletterMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl className="w-full">
                    <textarea
                      {...field}
                      className="bg-gray-100 border border-gray-200 rounded-lg w-full p-4 min-h-[200px] resize-none placeholder:text-gray-500"
                      placeholder="Enter newsletter content..."
                      disabled={sendNewsletterMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-sm text-gray-500 mt-1">
                    This will be sent to all subscribed users. You can use line
                    breaks for formatting.
                  </p>
                </FormItem>
              )}
            />

            <Flex className="justify-end gap-3 mt-4">
              <Button
                variant="outline"
                className="bg-white hover:bg-gray-50 text-black border border-gray-200 font-normal rounded-full px-6 py-5 flex items-center gap-2 cursor-pointer"
                type="button"
                onClick={() => {
                  form.reset();
                  onClose();
                }}
                disabled={sendNewsletterMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                className="bg-[#1797b9] hover:bg-[#1797b9]/80 hover:text-white text-white border border-gray-200 rounded-full px-6 py-5 flex items-center gap-2 cursor-pointer"
                type="submit"
                disabled={sendNewsletterMutation.isPending}
              >
                {sendNewsletterMutation.isPending
                  ? "Sending..."
                  : "Send Newsletter"}
              </Button>
            </Flex>
          </Box>
        </form>
      </Form>
    </GeneralModal>
  );
};
