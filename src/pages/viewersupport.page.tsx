import { Box } from "@/components/ui/box";
import { ViewerSupportHeader } from "@/components/viewer section/viewer support/viewersupportheader";
import { useEffect } from "react";

const ViewerSupportPage = () => {
  useEffect(() => {
    scrollTo(0, 0);
    document.title = "Viewer Support - Flowlio";
  }, []);

  return (
    <Box className="px-2">
      <ViewerSupportHeader />
    </Box>
  );
};

export default ViewerSupportPage;
