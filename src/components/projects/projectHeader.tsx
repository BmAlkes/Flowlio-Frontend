import { PageWrapper } from "../common/pagewrapper";
import { ProjectTable } from "./projecttable";
import { Center } from "../ui/center";
import { Stack } from "../ui/stack";
import { Button } from "../ui/button";
import { CirclePlus } from "lucide-react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

export const ProjectHeader = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <PageWrapper className="mt-6">
      <Center className="justify-between px-4 py-6 max-sm:flex-col max-sm:items-start gap-2">
        <Stack className="gap-1">
          <h1 className="text-black text-3xl max-sm:text-xl font-medium">
            {t("projects.title")}
          </h1>
          <h1 className={`max-sm:text-sm max-w-[600px] text-gray-500`}>
            {t("projects.subtitle")}
          </h1>
        </Stack>

        <Button
          variant="outline"
          className="bg-black text-white border border-gray-200  rounded-full px-6 py-5 flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/dashboard/project/create-project")}
        >
          <CirclePlus className="fill-white text-black size-5" />
          {t("projects.createNewProject")}
        </Button>
      </Center>

      <ProjectTable />
    </PageWrapper>
  );
};
