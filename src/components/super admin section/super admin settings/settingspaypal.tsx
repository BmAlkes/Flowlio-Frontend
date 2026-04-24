import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import {
  GeneralModal,
  useGeneralModalDisclosure,
} from "@/components/common/generalmodal";
import { PayPalConfigModal } from "./paypalconfigmodal";
import { useTranslation } from "react-i18next";

export const SettingsPayPal = () => {
  const { t } = useTranslation();
  const modalProps = useGeneralModalDisclosure();

  const handleOpenModal = () => {
    modalProps.onOpenChange(true);
  };

  return (
    <Box>
      <h1 className="text-xl font-semibold">{t("settings.paypalTitle", "PayPal Configuration")}</h1>
      <h4 className="max-md:text-sm">
        {t("settings.paypalDesc", "View and manage your PayPal payment account settings. Check which account is receiving payments.")}
      </h4>

      <Box className="mt-8">
        <Flex className="justify-between text-start w-full bg-accent dark:bg-accent/40 border border-border/80 py-4 px-8 rounded-md max-md:px-3">
          <Flex className="flex-col gap-1 justify-start text-start">
            <Flex className="items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <h1 className="text-lg max-md:text-sm font-medium text-start">
                {t("settings.paypalAccountSettings", "PayPal Account Settings")}
              </h1>
            </Flex>
            <p className="text-sm text-muted-foreground max-md:text-xs">
              {t("settings.paypalCheckWhich", "Check which PayPal account is configured and receiving payments")}
            </p>
          </Flex>
          <Button
            onClick={handleOpenModal}
            className="bg-[#1797b9] hover:bg-[#1797b9]/80 rounded-full px-6 cursor-pointer"
          >
            {t("settings.viewConfiguration", "View Configuration")}
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
