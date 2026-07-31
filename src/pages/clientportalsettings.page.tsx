import { Box } from "@/components/ui/box";
import { Stack } from "@/components/ui/stack";
import { ViewerSettingsHeader } from "@/components/viewer section/viewer settings/viewersettingsheader";
import { ClientBillingSettings } from "@/components/client management/clientbillingsettings";

/**
 * Client portal profile & security. Uses the same UI as viewer settings:
 * PUT /user/profile (name, email, phone, address), profile image, password, 2FA, notification prefs (PATCH).
 * Adds a client-specific Billing section (billing contact email, invoice/proposal notifications)
 * that doesn't apply to the viewer role.
 */
const ClientPortalSettingsPage = () => {
  return (
    <Box className="px-2">
      <ViewerSettingsHeader />
      <Stack className="px-8 max-md:px-3 pb-8">
        <ClientBillingSettings />
      </Stack>
    </Box>
  );
};

export default ClientPortalSettingsPage;
