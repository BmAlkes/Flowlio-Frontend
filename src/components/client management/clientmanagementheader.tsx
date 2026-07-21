import { PageWrapper } from "../common/pagewrapper";
import { Center } from "../ui/center";
import { Stack } from "../ui/stack";
import { Button } from "../ui/button";
import { useNavigate } from "react-router";
import { CirclePlus, Settings2 } from "lucide-react";
import {
  GeneralModal,
  useGeneralModalDisclosure,
} from "../common/generalmodal";
import { CustomFieldsManager } from "../projects/customfields/CustomFieldsManager";
import { Box } from "../ui/box";
import { Flex } from "../ui/flex";
import { ClientManagementTable } from "./clientmanagementtable";
import { useTranslation } from "react-i18next";

export const ClientManagementHeader = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const customFieldsModal = useGeneralModalDisclosure();

  return (
    <PageWrapper className="mt-6">
      <Center className="justify-between px-4 py-6 max-sm:flex-col max-sm:items-start gap-2">
        <Stack className="gap-1">
          <h1 className="text-foreground text-3xl max-sm:text-xl font-medium">
            {t("appSidebar.clientManagement")}
          </h1>
          <h1 className={`max-sm:text-sm max-w-[600px] text-muted-foreground`}>
            {t("clientManagement.subtitle")}
          </h1>
        </Stack>

        <Flex className="gap-2 items-center flex-wrap max-sm:justify-start">
          <Button
            variant="outline"
            className="bg-black text-white border border-border rounded-full px-6 py-5 flex items-center gap-2 cursor-pointer hover:bg-muted/50"
            onClick={() => customFieldsModal.onOpenChange(true)}
          >
            <Settings2 className="w-4 h-4" />
            {t("clientManagement.customFields")}
          </Button>

          <Button
            variant="outline"
            className="bg-black text-white border border-border rounded-full px-6 py-5 flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/dashboard/client-management/create-client")}
          >
            <CirclePlus className="size-5 text-white" />
            {t("clientManagement.createNewClient")}
          </Button>
        </Flex>
      </Center>

      <Box className="px-4">
        <ClientManagementTable />
      </Box>

      <GeneralModal {...customFieldsModal}>
        <Box className="p-1">
          <h2 className="text-xl font-semibold mb-4">
            {t("clientManagement.manageCustomFieldsTitle")}
          </h2>
          <CustomFieldsManager entityType="client" />
        </Box>
      </GeneralModal>
    </PageWrapper>
  );
};
