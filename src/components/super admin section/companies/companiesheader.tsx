import { PageWrapper } from "@/components/common/pagewrapper";
import { Center } from "@/components/ui/center";
import { Stack } from "@/components/ui/stack";
import { CompaniesTable } from "./companiestable";
import { useTranslation } from "react-i18next";

export const CompaniesHeader = () => {
  const { t } = useTranslation();
  return (
    <PageWrapper className="mt-6">
      <Center className="justify-between px-4 py-6">
        <Stack className="gap-1">
          <h1 className="text-foreground text-3xl max-sm:text-xl font-medium">
            {t("superadmin.companies.title")}
          </h1>
          <h1 className={`max-sm:text-sm max-w-[700px] text-muted-foreground`}>
            {t("superadmin.companies.subtitle")}
          </h1>
        </Stack>
      </Center>

      <CompaniesTable />
    </PageWrapper>
  );
};
