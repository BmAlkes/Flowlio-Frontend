import { PageWrapper } from "@/components/common/pagewrapper";
import { Center } from "@/components/ui/center";
import { Stack } from "@/components/ui/stack";
import { Box } from "@/components/ui/box";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersTable } from "./userstable";
import { UsersByOrganization } from "./usersbyorganization";
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

      <Box className="px-4 pb-6">
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-background border border-border shadow-sm p-1 h-auto">
            <TabsTrigger value="all" className="py-1.5 px-3">
              {t("superadmin.users.allUsers", "All Users")}
            </TabsTrigger>
            <TabsTrigger value="by-organization" className="py-1.5 px-3">
              {t("superadmin.users.byOrganization", "By Organization")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <UsersTable />
          </TabsContent>
          <TabsContent value="by-organization">
            <UsersByOrganization />
          </TabsContent>
        </Tabs>
      </Box>
    </PageWrapper>
  );
};
