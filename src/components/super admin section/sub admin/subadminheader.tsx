import { PageWrapper } from "@/components/common/pagewrapper";
import { Center } from "@/components/ui/center";
import { Stack } from "@/components/ui/stack";
import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";
import { useNavigate } from "react-router";
import { SubAdminTable } from "./subadmintable";
import { useTranslation } from "react-i18next";

export const SubAdminHeader = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <PageWrapper className="mt-6">
      <Center className="justify-between px-4 py-6 max-sm:flex-col max-sm:items-start gap-2">
        <Stack className="gap-1">
          <h1 className="text-foreground text-2xl max-sm:text-xl font-medium">
            {t("superadmin.subAdmins.title")}
          </h1>
          <h1 className={`max-sm:text-sm max-w-[600px] text-muted-foreground`}>
            {t("superadmin.subAdmins.subtitle")}
          </h1>
        </Stack>

        <Button
          variant="outline"
          className="bg-black text-white border border-border  rounded-full px-6 py-5 flex items-center gap-2 cursor-pointer w-42 h-12"
          onClick={() => navigate("/superadmin/sub-admin/create-sub-admin")}
        >
          <CirclePlus className="size-5 text-white" />
          {t("superadmin.subAdmins.create")}
        </Button>
      </Center>

      <SubAdminTable />
    </PageWrapper>
  );
};
