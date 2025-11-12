import { SuperAdminSettingsHeader } from "@/components/super admin section/super admin settings/superadminsettingsheader";
import { Box } from "@/components/ui/box";
import { useUser } from "@/providers/user.provider";

const SuperAdminSettingsPage = () => {
  const { data } = useUser();
  return (
    <Box className="px-2">
      <SuperAdminSettingsHeader user={data?.user} />
    </Box>
  );
};

export default SuperAdminSettingsPage;
