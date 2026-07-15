import { useEffect } from "react";
import { useParams } from "react-router";
import { Center } from "@/components/ui/center";
import { Box } from "@/components/ui/box";
import { Stack } from "@/components/ui/stack";
import { useFetchPublicPaymentLink } from "@/hooks/usefetchpaymentlinks";
import { Loader2, XCircle, CheckCircle2, ExternalLink, ShieldCheck } from "lucide-react";

const PaymentLinkPublicPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useFetchPublicPaymentLink(id ?? "");

  useEffect(() => {
    document.title = "Payment Request - Flowlio";
  }, []);

  const link = data?.data;
  const isPaid = link?.status === "paid";

  return (
    <Center className="min-h-screen bg-background p-4">
      <Box className="max-w-md w-full bg-card rounded-2xl border border-border shadow-lg p-8">
        {isLoading ? (
          <Stack className="gap-4 items-center text-center py-8">
            <Loader2 className="h-10 w-10 text-[#1797B9] animate-spin" />
            <p className="text-muted-foreground">Loading payment details...</p>
          </Stack>
        ) : error || !link ? (
          <Stack className="gap-4 items-center text-center py-8">
            <XCircle className="h-14 w-14 text-red-500" />
            <h1 className="text-xl font-semibold text-foreground">Payment link not found</h1>
            <p className="text-muted-foreground text-sm">
              This link may have been removed, or the URL is incorrect. Please contact whoever sent it to you.
            </p>
          </Stack>
        ) : (
          <Stack className="gap-5">
            <div className="text-center">
              <p className="text-sm text-muted-foreground/90">Payment request from</p>
              <h1 className="text-xl font-semibold text-foreground">{link.organizationName}</h1>
            </div>

            {isPaid && (
              <div className="flex items-center justify-center gap-2 bg-green-50 dark:bg-green-500/15 border border-green-200 dark:border-green-500/30 rounded-lg py-2.5">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">This payment has already been marked as paid</span>
              </div>
            )}

            <div className="bg-muted/50 rounded-xl p-5 text-center">
              <p className="text-xs text-muted-foreground/90 mb-1">Amount due</p>
              <p className="text-4xl font-bold text-foreground">${parseFloat(link.amount).toFixed(2)}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground/90">Project</span>
                <span className="font-medium text-foreground">{link.project}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground/90 block mb-1">Description</span>
                <p className="text-foreground">{link.description}</p>
              </div>
            </div>

            {!isPaid && (
              <a
                href={link.externalPaymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-[#1797B9] hover:bg-[#1797B9]/90 text-white font-medium rounded-full px-6 py-3 transition-colors"
              >
                Pay Now <ExternalLink className="h-4 w-4" />
              </a>
            )}

            <div className="flex items-start gap-2 text-xs text-muted-foreground/90 pt-2 border-t border-border">
              <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                You'll be redirected to {link.organizationName}'s own secure payment provider. Flowlio does not process or store this payment.
              </span>
            </div>
          </Stack>
        )}
      </Box>
    </Center>
  );
};

export default PaymentLinkPublicPage;
