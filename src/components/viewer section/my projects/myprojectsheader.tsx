import { PageWrapper } from "@/components/common/pagewrapper";
import { Center } from "@/components/ui/center";
import { Stack } from "@/components/ui/stack";
import { MyProjectsTable } from "./myprojectstable";
import { useTranslation } from "react-i18next";

export const MyProjectsHeader = () => {
  const { t } = useTranslation();
  return (
    <PageWrapper className="mt-6">
      <Center className="justify-between px-4 py-6 max-sm:flex-col max-sm:items-start gap-2">
        <Stack className="gap-1">
          <h1 className="text-foreground text-3xl max-sm:text-xl font-medium">
            {t("projects.myProjects")}
          </h1>
          <h1 className={`max-sm:text-sm max-w-[600px] text-muted-foreground`}>
            {t("projects.subtitle")}
          </h1>
        </Stack>
      </Center>

      <MyProjectsTable />
    </PageWrapper>
  );
};
