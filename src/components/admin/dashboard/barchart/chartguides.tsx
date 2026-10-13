import { Flex, type FlexProps } from "@/components/ui/flex";
import { Center } from "@/components/ui/center";
import { Box } from "@/components/ui/box";
import { type FC } from "react";
import { useTranslation } from "react-i18next";

export const ChartGuides: FC<FlexProps> = ({ ...props }) => {
  const { t } = useTranslation();
  return (
    <Flex {...props}>
      <Center className="gap-1">
        <Box className="bg-[#1797B9] rounded-full size-1.5" />
        <span className="text-xs">{t("charts.completedTasks")}</span>
      </Center>
      <Center className="gap-1">
        <Box className="bg-[#e4b458] rounded-full size-1.5" />
        <span className="text-xs">{t("charts.inProgressTasks")}</span>
      </Center>
      <Center className="gap-1">
        <Box className="bg-[#dd8066] rounded-full size-1.5" />
        <span className="text-xs">{t("charts.delayedTasks")}</span>
      </Center>
    </Flex>
  );
};
