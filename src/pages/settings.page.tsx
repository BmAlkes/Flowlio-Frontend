import { SettingsHeader } from "@/components/settings/settingsheader";
import { Box } from "@/components/ui/box";
import { AuditSettingsLink } from "@/components/settings/AuditSettingsLink";
import { CurrencySettings } from "@/components/settings/CurrencySettings";
import { WhatsAppSettings } from "@/components/settings/WhatsAppSettings";

const SettingPage = () => {
  return (
    <Box className="px-2">
      <AuditSettingsLink />
      <SettingsHeader organizationSettings={<><CurrencySettings /><WhatsAppSettings /></>} />
    </Box>
  );
};
export default SettingPage;
