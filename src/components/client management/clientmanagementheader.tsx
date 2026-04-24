import { PageWrapper } from "../common/pagewrapper";
import { Center } from "../ui/center";
import { Stack } from "../ui/stack";
import { Button } from "../ui/button";
import { useNavigate } from "react-router";
import { CirclePlus, Settings2, LayoutGrid, List } from "lucide-react";
import {
  GeneralModal,
  useGeneralModalDisclosure,
} from "../common/generalmodal";
import { CustomFieldsManager } from "../projects/customfields/CustomFieldsManager";
import { Box } from "../ui/box";
import { Flex } from "../ui/flex";
import { ClientManagementTable } from "./clientmanagementtable";
import { useTranslation } from "react-i18next";
import { CRMPipeline } from "./CRMPipeline";
import { useState } from "react";

export const ClientManagementHeader = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const customFieldsModal = useGeneralModalDisclosure();
  const [view, setView] = useState("table");

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

        <Flex className="gap-2 items-center">
          {/* View Toggle */}
          <Box className="bg-muted/50 p-1 rounded-full border border-border flex items-center mr-2">
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-full h-8 px-4 flex items-center gap-2 ${view === "table" ? "bg-white dark:bg-gray-800 shadow-sm text-indigo-600" : "text-muted-foreground"}`}
              onClick={() => setView("table")}
            >
              <List className="w-4 h-4" />
              <span className="text-xs font-medium">Table</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-full h-8 px-4 flex items-center gap-2 ${view === "pipeline" ? "bg-white dark:bg-gray-800 shadow-sm text-indigo-600" : "text-muted-foreground"}`}
              onClick={() => setView("pipeline")}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="text-xs font-medium">Pipeline</span>
            </Button>
          </Box>

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
            className="bg-black text-white border border-border  rounded-full px-6 py-5 flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/dashboard/client-management/create-client")}
          >
            <CirclePlus className="size-5 text-white" />
            {t("clientManagement.createNewClient")}
          </Button>
        </Flex>
      </Center>

      <Box className="px-4">
        {view === "table" ? (
          <ClientManagementTable />
        ) : (
          <CRMPipeline />
        )}
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
