import { Link } from "react-router";
import { useUser } from "@/providers/user.provider";
import { useTranslation } from "react-i18next";
import { SettingsHeader } from "@/components/settings/settingsheader";
import { Box } from "@/components/ui/box";

const SettingPage = () => {
  const { data }=useUser();
  const { t }=useTranslation();
  const canMonitor=data?.user.isOrganizationOwner || data?.user.isOrganizationManager || data?.user.isSuperAdmin;
  return (
    <Box className="px-2">
      {canMonitor && <div className="flex justify-end px-4 py-2"><Link className="text-sm text-[#1797ba] underline underline-offset-4" to="/dashboard/settings/operations">{t("operations.title")}</Link></div>}
      <SettingsHeader />
    </Box>
  );
};
export default SettingPage;
