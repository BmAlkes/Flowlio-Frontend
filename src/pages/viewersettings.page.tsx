import { Box } from "@/components/ui/box";
import { PrivacySettings } from "@/components/settings/PrivacySettings";
import { ViewerSettingsHeader } from "@/components/viewer section/viewer settings/viewersettingsheader";

const ViewerSettingsPage = () => {
  return (
    <Box className="px-2">
      <ViewerSettingsHeader />
      <Box className="px-8 max-md:px-3 pb-8">
        <PrivacySettings />
      </Box>
    </Box>
  );
};

export default ViewerSettingsPage;
