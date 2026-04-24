import { PageWrapper } from "../common/pagewrapper";
import { ProjectTable } from "./projecttable";
import { Center } from "../ui/center";
import { Stack } from "../ui/stack";
import { Button } from "../ui/button";
import { CirclePlus, Eye } from "lucide-react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import GranttChart from "../Grantt/granttchart";
import { Box } from "../ui/box";
import { Flex } from "../ui/flex";
import { useState } from "react";
import { Settings2 } from "lucide-react";
import {
  GeneralModal,
  useGeneralModalDisclosure,
} from "../common/generalmodal";
import { CustomFieldsManager } from "./customfields/CustomFieldsManager";
import { useUser } from "@/providers/user.provider";

export const ProjectHeader = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: userData } = useUser();
  const isClient = userData?.user?.role === "client";
  const [showGranttChart, setShowGranttChart] = useState(false);
  const customFieldsModal = useGeneralModalDisclosure();

  return (
    <PageWrapper className="mt-6">
      <Center className="justify-between px-4 py-6 max-sm:flex-col max-sm:items-start gap-2">
        <Stack className="gap-1">
          <h1 className="text-foreground text-3xl max-sm:text-xl font-medium">
            {t("projects.title")}
          </h1>
          <h1 className={`max-sm:text-sm max-w-[600px] text-muted-foreground`}>
            {t("projects.subtitle")}
          </h1>
        </Stack>

        {!isClient && (
          <Flex className="gap-2">
            <Button
              variant="outline"
              className="bg-black text-white border border-border rounded-full px-6 py-5 items-center gap-2 cursor-pointer hover:bg-muted/50"
              onClick={() => customFieldsModal.onOpenChange(true)}
            >
              <Settings2 className="w-4 h-4" />
              Custom Fields
            </Button>
            <Button
              variant="outline"
              className="bg-black text-white border border-border rounded-full px-6 py-5 items-center gap-2 cursor-pointer hover:bg-muted/50"
              onClick={() => navigate("/dashboard/project/templates")}
            >
              <Settings2 className="w-4 h-4" />
              Project Templates
            </Button>
            <Button
              variant="outline"
              className="bg-black text-white border border-border  rounded-full px-6 py-5 flex items-center gap-2 cursor-pointer"
              onClick={() =>
                !showGranttChart
                  ? setShowGranttChart(true)
                  : setShowGranttChart(false)
              }
            >
              <Eye className="size-5 text-white" />
              {showGranttChart ? "Hide Project Grantt" : "View Project Grantt"}
            </Button>
            <Button
              variant="outline"
              className="bg-black text-white border border-border  rounded-full px-6 py-5 flex items-center gap-2 cursor-pointer"
              onClick={() => navigate("/dashboard/project/create-project")}
            >
              <CirclePlus className="size-5 text-white" />
              {t("projects.createNewProject")}
            </Button>
          </Flex>
        )}
      </Center>

      {(!showGranttChart || isClient) && <ProjectTable isClient={isClient} />}

      {!isClient && (
        <Box className="p-4">{showGranttChart && <GranttChart />}</Box>
      )}

      {!isClient && (
        <GeneralModal {...customFieldsModal}>
          <Box className="p-1">
            <h2 className="text-xl font-semibold mb-4">Manage Custom Fields</h2>
            <CustomFieldsManager entityType="project" />
          </Box>
        </GeneralModal>
      )}
    </PageWrapper>
  );
};
