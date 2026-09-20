import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { SuperAdminSettingsHeader } from "@/components/super admin section/super admin settings/superadminsettingsheader";
import { Box } from "@/components/ui/box";
import { useUser } from "@/providers/user.provider";

const SuperAdminSettingsPage = () => {
  const { data } = useUser();
  const { t }=useTranslation();
  return (
    <Box className="px-2">
      <div className="flex justify-end px-4 py-2"><Link className="text-sm text-[#1797ba] underline underline-offset-4" to="/superadmin/operations">{t("operations.title")}</Link></div>
      <SuperAdminSettingsHeader user={data?.user} />
    </Box>
  );
};

export default SuperAdminSettingsPage;
