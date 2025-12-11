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
        <Box className="bg-[#3f53b5] rounded-full size-1.5" />
        <h1 className="text-xs">{t("charts.completedTasks")}</h1>
      </Center>
      <Center className="gap-1">
        <Box className="bg-yellow-400 rounded-full size-1.5" />
        <h1 className="text-xs">{t("charts.inProgressTasks")}</h1>
      </Center>
      <Center className="gap-1">
        <Box className="bg-red-500 rounded-full size-1.5" />
        <h1 className="text-xs">{t("charts.delayedTasks")}</h1>
      </Center>
    </Flex>
  );
};
