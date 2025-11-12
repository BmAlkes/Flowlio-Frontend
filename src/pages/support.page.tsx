import SupportHeader from "@/components/support/supportheader";
import { Box } from "@/components/ui/box";
import { useEffect } from "react";

const SupportPage = () => {
  useEffect(() => {
    scrollTo(0, 0);
    document.title = "Support - Flowlio";
  }, []);
  return (
    <Box className="px-2">
      <SupportHeader />
    </Box>
  );
};

export default SupportPage;
