import { PageWrapper } from "@/components/common/pagewrapper";
import { Box } from "@/components/ui/box";
import { Stack } from "@/components/ui/stack";
import { ClientTimeline } from "@/components/client management/ClientTimeline";
import { useUser } from "@/providers/user.provider";
import { useTranslation } from "react-i18next";

const ClientActivityPage = () => {
  const { t } = useTranslation();
  const { data: userData } = useUser();
  const clientId = userData?.user?.clientId;

  return (
    <PageWrapper className="mt-6">
      <Stack className="gap-1 p-6 mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t("activity.title")}</h1>
        <p className="text-muted-foreground">
          {t("activity.subtitle")}
        </p>
      </Stack>

      <Box className="max-w-4xl mx-auto p-6 bg-card border border-border rounded-2xl shadow-sm">
        {clientId ? (
          <ClientTimeline clientId={clientId} mode="client" />
        ) : (
          <Box className="text-center py-10 text-muted-foreground">
            {t("activity.noClient")}
          </Box>
        )}
      </Box>
    </PageWrapper>
  );
};

export default ClientActivityPage;
