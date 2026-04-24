import { Box } from "@/components/ui/box";
import { ViewerSettingsHeader } from "@/components/viewer section/viewer settings/viewersettingsheader";

/**
 * Client portal profile & security. Uses the same UI as viewer settings:
 * PUT /user/profile (name, email, phone, address), profile image, password, 2FA, notification prefs (PATCH).
 */
const ClientPortalSettingsPage = () => {
  return (
    <Box className="px-2">
      <ViewerSettingsHeader />
    </Box>
  );
};

export default ClientPortalSettingsPage;
