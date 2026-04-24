import { PageWrapper } from "@/components/common/pagewrapper";
import { Center } from "@/components/ui/center";
import { Stack } from "@/components/ui/stack";
import { UsersTable } from "./userstable";
import { useTranslation } from "react-i18next";

export const UsersHeader = () => {
  const { t } = useTranslation();
  return (
    <PageWrapper className="mt-6">
      <Center className="justify-between px-4 py-6">
        <Stack className="gap-1">
          <h1 className="text-foreground text-3xl max-sm:text-xl font-medium">
            {t("superadmin.users.title")}
          </h1>
          <h1 className={`max-sm:text-sm max-w-[700px] text-muted-foreground`}>
            {t("superadmin.users.subtitle")}
          </h1>
        </Stack>
      </Center>

      <UsersTable />
    </PageWrapper>
  );
};
