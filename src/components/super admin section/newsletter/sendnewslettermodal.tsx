import { FC, useState } from "react";
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
import { useFetchNewsletterStats } from "@/hooks/usefetchnewslettersubscribers";
import { toast } from "sonner";
import RichTextEditor from "@/components/common/RichTextEditor";
import { sanitizeHTML } from "@/utils/sanitize";
import { Eye, Send, X, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const [isPreview, setIsPreview] = useState(false);

  const form = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      subject: "",
      content: "",
    },
  });

  const sendNewsletterMutation = useSendNewsletter();
  const { data: statsResponse } = useFetchNewsletterStats();
  const stats = statsResponse?.data;

  const onSubmit = async (data: NewsletterFormData) => {
    // Sanitize HTML before sending
    const sanitizedContent = sanitizeHTML(data.content);

    console.log("[Newsletter Modal] Form submitted:", {
      subject: data.subject,
      contentLength: sanitizedContent.length,
      timestamp: new Date().toISOString(),
    });

    try {
      const result = await sendNewsletterMutation.mutateAsync({
        ...data,
        content: sanitizedContent,
      });

      console.log("[Newsletter Modal] Response received:", result);

      if (result.data?.successful) {
        const successMessage = `Newsletter sent successfully to ${
          result.data?.successful || 0
        } subscribers!`;
        
        toast.success(successMessage);
        form.reset();
        setIsPreview(false);
        onClose();
      } else {
        const errorMessage = result.message || "Failed to send newsletter";
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to send newsletter. Please try again.";
      toast.error(errorMessage);
    }
  };


  return (
    <GeneralModal
      withoutCloseButton
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          form.reset();
          setIsPreview(false);
          onClose();
        }
      }}
      contentProps={{
        className:
          "max-w-4xl max-h-[95vh] overflow-y-auto w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-[80vw] xl:w-[75vw] p-0 border-none bg-transparent shadow-none",
      }}
    >
      <Box className="bg-card rounded-2xl overflow-hidden flex flex-col h-full max-h-[90vh]">
        {/* Header */}
        <Flex className="items-center justify-between p-6 border-b border-border bg-muted/30">
          <Flex className="items-center gap-3">
            <Box className="p-2 bg-[#1797b9]/10 rounded-lg text-[#1797b9]">
              <Send size={20} />
            </Box>
            <h2 className="text-xl font-semibold text-foreground">{t("superadmin.newsletter.sendNewsletter", "Send Newsletter")}</h2>
          </Flex>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              form.reset();
              setIsPreview(false);
              onClose();
            }}
            className="rounded-full hover:bg-muted"
          >
            <X size={20} />
          </Button>
        </Flex>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-grow flex flex-col overflow-hidden">
            <Box className="p-6 space-y-6 overflow-y-auto">
              {/* Subject Field */}
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-muted-foreground">{t("superadmin.newsletter.modal.subject", "Newsletter Subject")}</FormLabel>
                    <FormControl>
                      <input
                        {...field}
                        className="bg-muted/50 border border-border rounded-xl w-full h-12 px-4 focus:ring-2 focus:ring-[#1797b9]/20 focus:border-[#1797b9] transition-all outline-none"
                        placeholder="e.g. Weekly Updates - March 2024"
                        disabled={sendNewsletterMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Recipient Info */}
              <Flex className="items-center gap-3 p-4 bg-[#1797b9]/5 border border-[#1797b9]/10 rounded-xl">
                <Box className="p-2 bg-[#1797b9]/10 rounded-lg text-[#1797b9]">
                  <ClipboardList size={18} />
                </Box>
                <Box>
                  <p className="text-sm font-semibold text-foreground">
                    {t("superadmin.newsletter.modal.recipientInfo", "Target Audience")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats ? (
                      t("superadmin.newsletter.modal.sendingToCount", "This newsletter will be sent to {{count}} active subscribers.", { count: stats.subscribed })
                    ) : (
                      t("superadmin.newsletter.modal.calculatingRecipients", "Calculating recipients...")
                    )}
                  </p>
                </Box>
              </Flex>

              {/* Toggle Preview / Edit */}
              <Flex className="justify-between items-center bg-muted/50 p-2 rounded-xl">
                <p className="text-xs text-muted-foreground font-medium px-2">
                  {isPreview ? t("superadmin.newsletter.modal.previewing", "Previewing Email Layout") : t("superadmin.newsletter.modal.composing", "Composing Newsletter Content")}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPreview(!isPreview)}
                  className={cn(
                    "rounded-lg flex items-center gap-2 text-xs font-semibold px-3 py-1.5 transition-all",
                    isPreview 
                      ? "bg-card text-[#1797b9] shadow-sm" 
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {isPreview ? (
                    <>
                      <ClipboardList size={14} />
                      {t("superadmin.newsletter.modal.backToEditor", "Back to Editor")}
                    </>
                  ) : (
                    <>
                      <Eye size={14} />
                      {t("superadmin.newsletter.modal.previewMode", "Preview Mode")}
                    </>
                  )}
                </Button>
              </Flex>

              {/* Content / Preview Area */}
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem className="flex-grow flex flex-col space-y-2">
                    <FormLabel className="sr-only">Content</FormLabel>
                    <FormControl>
                      {isPreview ? (
                        <Box className="bg-muted p-8 rounded-xl min-h-[400px] border border-border overflow-y-auto">
                          {/* Simulated Email Browser Container */}
                          <Box className="max-w-2xl mx-auto bg-card shadow-lg rounded-lg overflow-hidden border border-border">
                            {/* Email Header Simulation */}
                            <Box className="bg-[#1797b9] p-6 text-center">
                              <h1 className="text-white text-xl font-bold tracking-tight">NEWSLETTER</h1>
                            </Box>
                            
                            {/* Rendered Sanitized content */}
                            <Box 
                              className="p-8 prose prose-gray max-w-none newsletter-preview"
                              dangerouslySetInnerHTML={{ __html: sanitizeHTML(field.value) }} 
                            />
                            
                            {/* Email Footer Simulation */}
                            <Box className="bg-muted/50 p-6 border-t border-border text-center">
                              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                                Sent via Flowlio Newsletter Service
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-2">
                                © 2024 Flowlio. All rights reserved.
                              </p>
                            </Box>
                          </Box>
                        </Box>
                      ) : (
                        <RichTextEditor
                          content={field.value}
                          onChange={field.onChange}
                          className="min-h-[400px]"
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Box>

            {/* Footer Actions */}
            <Flex className="p-6 border-t border-border justify-end gap-3 bg-muted/30">
              <Button
                variant="outline"
                className="bg-card hover:bg-muted/50 text-muted-foreground border-border rounded-full px-6 h-11 transition-all"
                type="button"
                onClick={() => {
                  form.reset();
                  setIsPreview(false);
                  onClose();
                }}
                disabled={sendNewsletterMutation.isPending}
              >
                {t("common.cancel", "Discard")}
              </Button>
              <Button
                className="bg-[#1797b9] hover:bg-[#117a96] text-white shadow-md shadow-[#1797b9]/20 rounded-full px-8 h-11 flex items-center gap-2 font-semibold transition-all"
                type="submit"
                disabled={sendNewsletterMutation.isPending || !form.formState.isValid}
              >
                {sendNewsletterMutation.isPending ? (
                  <>
                    <Box className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("superadmin.newsletter.modal.sending", "Sending...")}
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    {t("superadmin.newsletter.sendNewsletter", "Send Newsletter")}
                  </>
                )}
              </Button>
            </Flex>
          </form>
        </Form>
      </Box>
    </GeneralModal>
  );
};

// Add display name for debugging
SendNewsletterModal.displayName = "SendNewsletterModal";

