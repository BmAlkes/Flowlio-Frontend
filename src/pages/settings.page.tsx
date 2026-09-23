import { SettingsHeader } from "@/components/settings/settingsheader";
import { Box } from "@/components/ui/box";
import { AuditSettingsLink } from "@/components/settings/AuditSettingsLink";

const SettingPage = () => {
  return (
    <Box className="px-2">
      <AuditSettingsLink />
      <SettingsHeader />
    </Box>
  );
};
export default SettingPage;
