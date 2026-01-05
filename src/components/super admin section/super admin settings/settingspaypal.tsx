import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import {
  GeneralModal,
  useGeneralModalDisclosure,
} from "@/components/common/generalmodal";
import { PayPalConfigModal } from "./paypalconfigmodal";

export const SettingsPayPal = () => {
  const modalProps = useGeneralModalDisclosure();

  const handleOpenModal = () => {
    modalProps.onOpenChange(true);
  };

  return (
    <Box>
      <h1 className="text-xl font-semibold">PayPal Configuration</h1>
      <h4 className="max-md:text-sm">
        View and manage your PayPal payment account settings. Check which
        account is receiving payments.
      </h4>

      <Box className="mt-8">
        <Flex className="justify-between text-start w-full bg-accent border border-gray-400/50 py-4 px-8 rounded-md max-md:px-3">
          <Flex className="flex-col gap-1 justify-start text-start">
            <Flex className="items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <h1 className="text-lg max-md:text-sm font-medium text-start">
                PayPal Account Settings
              </h1>
            </Flex>
            <p className="text-sm text-gray-600 max-md:text-xs">
              Check which PayPal account is configured and receiving payments
            </p>
          </Flex>
          <Button
            onClick={handleOpenModal}
            className="bg-[#1797b9] hover:bg-[#1797b9]/80 rounded-full px-6 cursor-pointer"
          >
            View Configuration
          </Button>
        </Flex>
      </Box>

      {/* PayPal Config Modal */}
      <GeneralModal {...modalProps}>
        <PayPalConfigModal onClose={() => modalProps.onOpenChange(false)} />
      </GeneralModal>
    </Box>
  );
};
