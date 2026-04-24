import { useState } from "react";
import { PageWrapper } from "@/components/common/pagewrapper";
import { Center } from "@/components/ui/center";
import { Stack } from "@/components/ui/stack";
import { Button } from "@/components/ui/button";
import { NewsletterSubscribersTable } from "./newslettersubscriberstable";
import { SendNewsletterModal } from "./sendnewslettermodal";
import { Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

export const NewsletterHeader = () => {
  const { t } = useTranslation();
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  return (
    <PageWrapper className="mt-6">
      <Center className="justify-between px-4 py-6 max-sm:flex-col max-sm:items-start gap-2">
        <Stack className="gap-1">
          <h1 className="text-foreground text-3xl max-sm:text-xl font-medium">
            {t("superadmin.newsletter.title", "Newsletter Subscribers")}
          </h1>
          <h1 className={`max-sm:text-sm max-w-[700px] text-muted-foreground`}>
            {t("superadmin.newsletter.subtitle", "View and manage all newsletter subscribers. Track subscription statistics and manage email lists.")}
          </h1>
        </Stack>

        <Button
          onClick={() => setIsSendModalOpen(true)}
          className="bg-foreground text-background hover:bg-foreground/90 hover:text-background border border-transparent rounded-full px-6 py-5 flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Mail className="size-5" />
          {t("superadmin.newsletter.sendNewsletter", "Send Newsletter")}
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
