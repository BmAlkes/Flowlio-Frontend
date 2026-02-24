import { PageWrapper } from "../common/pagewrapper";
import { Center } from "../ui/center";
import { Stack } from "../ui/stack";
import { Button } from "../ui/button";
import { useNavigate } from "react-router";
import { CirclePlus, Settings2 } from "lucide-react";
import { GeneralModal, useGeneralModalDisclosure } from "../common/generalmodal";
import { CustomFieldsManager } from "../projects/customfields/CustomFieldsManager";
import { Box } from "../ui/box";
import { Flex } from "../ui/flex";
import { ClientManagementTable } from "./clientmanagementtable";

export const ClientManagementHeader = () => {
  const navigate = useNavigate();
  const customFieldsModal = useGeneralModalDisclosure();

  return (
    <PageWrapper className="mt-6">
      <Center className="justify-between px-4 py-6 max-sm:flex-col max-sm:items-start gap-2">
        <Stack className="gap-1">
          <h1 className="text-black text-3xl max-sm:text-xl font-medium">
            Client Management
          </h1>
          <h1 className={`max-sm:text-sm max-w-[600px] text-gray-500`}>
            Track and manage clients efficiently
          </h1>
        </Stack>

        <Flex className="gap-2">
          <Button
            variant="outline"
            className="bg-black text-white border border-gray-200 rounded-full px-6 py-5 flex items-center gap-2 cursor-pointer hover:bg-gray-50"
            onClick={() => customFieldsModal.onOpenChange(true)}
          >
            <Settings2 className="w-4 h-4" />
            Custom Fields
          </Button>

          <Button
            variant="outline"
            className="bg-black text-white border border-gray-200  rounded-full px-6 py-5 flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/dashboard/client-management/create-client")}
          >
            <CirclePlus className="fill-white text-black size-5" />
            Create New Client
          </Button>
        </Flex>
      </Center>

      <ClientManagementTable />

      <GeneralModal {...customFieldsModal}>
        <Box className="p-1">
          <h2 className="text-xl font-semibold mb-4">Manage Custom Fields</h2>
          <CustomFieldsManager entityType="client" />
        </Box>
      </GeneralModal>
    </PageWrapper>
  );
};
