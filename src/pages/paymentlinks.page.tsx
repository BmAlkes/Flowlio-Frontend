import { PaymentLinksHeader } from "@/components/payment link/paymentlinksheader";
import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Stack } from "@/components/ui/stack";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { useHasFeatureAccess } from "@/hooks/usePlanAccess";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";

export const PaymentLinksPage = () => {
  const { data: featureAccess, isLoading } = useHasFeatureAccess("paymentLinks");
  const navigate = useNavigate();

  const hasAccess = featureAccess?.data?.hasAccess ?? true;

  if (isLoading) {
    return (
      <Center className="min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </Center>
    );
  }

  if (!hasAccess) {
    return (
      <Box className="px-2">
        <Center className="min-h-[60vh] flex-col gap-4 p-8">
          <div className="p-4 rounded-full bg-red-100">
            <Lock className="w-12 h-12 text-red-600" />
          </div>
          <Stack className="gap-2 text-center max-w-md">
            <h2 className="text-2xl font-semibold text-foreground">
              Payment Links Not Available
            </h2>
            <p className="text-muted-foreground">
              {featureAccess?.data?.reason ||
                "Payment Links is not included in your current plan. Upgrade to access this feature."}
            </p>
            <Button
              onClick={() => navigate("/dashboard/subscription")}
              className="mt-4"
            >
              View Plans & Upgrade
            </Button>
          </Stack>
        </Center>
      </Box>
    );
  }

  return (
    <Box className="px-2">
      <PaymentLinksHeader />
    </Box>
  );
};
