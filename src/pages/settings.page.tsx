import { SettingsHeader } from "@/components/settings/settingsheader";
import { Box } from "@/components/ui/box";
import { AuditSettingsLink } from "@/components/settings/AuditSettingsLink";
import { CurrencySettings } from "@/components/settings/CurrencySettings";

const SettingPage = () => {
  return (
    <Box className="px-2">
      <AuditSettingsLink />
      <CurrencySettings />
      <SettingsHeader />
    </Box>
  );
};
export default SettingPage;
