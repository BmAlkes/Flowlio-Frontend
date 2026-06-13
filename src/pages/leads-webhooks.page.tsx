import { Box } from "@/components/ui/box";
import { PageWrapper } from "@/components/common/pagewrapper";
import { WebhooksList } from "@/components/leads/webhooks/WebhooksList";
import { Webhook } from "lucide-react";

const LeadsWebhooksPage = () => {
  return (
    <Box className="px-2">
      <PageWrapper className="mt-6">
        <div className="px-4 py-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Webhook className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Webhooks</h1>
              <p className="text-muted-foreground text-sm">
                Automatically create leads from WordPress, Facebook, or any form
              </p>
            </div>
          </div>
          <WebhooksList />
        </div>
      </PageWrapper>
    </Box>
  );
};

export default LeadsWebhooksPage;
