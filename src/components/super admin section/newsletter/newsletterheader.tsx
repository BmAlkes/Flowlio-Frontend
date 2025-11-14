import { useState } from "react";
import { PageWrapper } from "@/components/common/pagewrapper";
import { Center } from "@/components/ui/center";
import { Stack } from "@/components/ui/stack";
import { Button } from "@/components/ui/button";
import { NewsletterSubscribersTable } from "./newslettersubscriberstable";
import { SendNewsletterModal } from "./sendnewslettermodal";
import { Mail } from "lucide-react";

export const NewsletterHeader = () => {
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  return (
    <PageWrapper className="mt-6">
      <Center className="justify-between px-4 py-6 max-sm:flex-col max-sm:items-start gap-2">
        <Stack className="gap-1">
          <h1 className="text-black text-3xl max-sm:text-xl font-medium">
            Newsletter Subscribers
          </h1>
          <h1 className={`max-sm:text-sm max-w-[700px] text-gray-500`}>
            View and manage all newsletter subscribers. Track subscription
            statistics and manage email lists.
          </h1>
        </Stack>

        <Button
          onClick={() => setIsSendModalOpen(true)}
          variant="outline"
          className="bg-black text-white border border-gray-200 rounded-full px-6 py-5 flex items-center gap-2 cursor-pointer"
        >
          <Mail className="size-5" />
          Send Newsletter
        </Button>
      </Center>

      <NewsletterSubscribersTable />

      <SendNewsletterModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
      />
    </PageWrapper>
  );
};
