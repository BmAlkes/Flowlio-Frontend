import { Box } from "@/components/ui/box";
import { PageWrapper } from "@/components/common/pagewrapper";
import { WebhookDetail } from "@/components/leads/webhooks/WebhookDetail";

const LeadsWebhookDetailPage = () => {
  return (
    <Box className="px-2">
      <PageWrapper className="mt-6">
        <div className="px-4 py-6">
          <WebhookDetail />
        </div>
      </PageWrapper>
    </Box>
  );
};

export default LeadsWebhookDetailPage;
