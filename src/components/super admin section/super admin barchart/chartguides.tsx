import { Flex, type FlexProps } from "@/components/ui/flex";
import { Center } from "@/components/ui/center";
import { Box } from "@/components/ui/box";
import { type FC } from "react";

export const SuperAdminChartGuides: FC<FlexProps> = ({ ...props }) => {
  return (
    <Flex {...props}>
      <Center className="gap-1">
        <Box className="bg-[#3f53b5] rounded-full p-1" />
        <h1 className="text-xs">Registered Companies</h1>
      </Center>

      <Center className="gap-1">
        <Box className="bg-red-500 rounded-full p-1" />
        <h1 className="text-xs">Projects Created</h1>
      </Center>
    </Flex>
  );
};
