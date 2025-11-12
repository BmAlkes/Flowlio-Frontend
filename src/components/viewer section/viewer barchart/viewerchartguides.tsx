import { Flex, type FlexProps } from "@/components/ui/flex";
import { Center } from "@/components/ui/center";
import { Box } from "@/components/ui/box";
import { type FC } from "react";

const dayColors = {
  Mon: "#3F51B5", // Blue
  Tue: "#E91E63", // Pink
  Wed: "#FFCC00", // Yellow
  Thurs: "#1B7C1F", // Green
  Fri: "#C43193", // Magenta
  Sat: "#2FBBE0", // Cyan
};

const dayLabels = [
  { key: "Mon", label: "Mon", color: dayColors.Mon },
  { key: "Tue", label: "Tue", color: dayColors.Tue },
  { key: "Wed", label: "Wed", color: dayColors.Wed },
  { key: "Thurs", label: "Thurs", color: dayColors.Thurs },
  { key: "Fri", label: "Fri", color: dayColors.Fri },
  { key: "Sat", label: "Sat", color: dayColors.Sat },
];

export const ViewerChartGuides: FC<FlexProps> = ({ ...props }) => {
  return (
    <Flex {...props}>
      {dayLabels.map((day) => (
        <Center className="gap-1">
          <Box
            className="rounded-full p-1"
            style={{ backgroundColor: day.color }}
          />
          <h1 className="text-xs">{day.label}</h1>
        </Center>
      ))}
    </Flex>
  );
};
