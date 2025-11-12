import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { cn } from "@/lib/utils";

export const InsightsCards = () => {
  const insightsDetails = [
    {
      title: "All Your Data, One Dashboard",
      description:
        "Visualize your team’s progress, productivity, and priorities in a single, interactive dashboard. See the full picture at a glance.",
      color: "#DED4FC",
    },
    {
      title: "Track What Matters Most",
      description:
        "Visualize your team’s progress, productivity, and priorities in a single, interactive dashboard. See the full picture at a glance.",
      color: "#73D5A4",
    },
    {
      title: "AI-Powered Insights",
      description:
        "Let Flowlio surface smart recommendations based on your workflow habits. Identify productivity drops, optimize task loads, and improve team efficiency—all powered by intelligent analysis.",
      color: "#333333",
    },
    {
      title: "Compare & Optimize",
      description:
        "Compare teams, timeframes, or projects to see what’s working—and what’s not. Get clear direction for continuous improvement.",
      color: "#FF596D",
    },
  ];

  return (
    <Center className="w-full h-full px-4 flex-col gap-10 absolute z-40 top-100 max-md:top-160">
      <Box className="flex flex-col gap-6 w-full items-center">
        <Center className="flex-col md:flex-row gap-6 w-full">
          {insightsDetails.slice(0, 2).map((insight, index) => (
            <Center
              key={index}
              className={cn(
                "bg-[url(/insights/bg.svg)] bg-cover bg-center w-[30rem] max-sm:w-full h-70 rounded-lg flex-col px-20 leading-5 text-start items-start gap-4",
                (index === 2 || index === 3) && "text-white"
              )}
              style={{ backgroundColor: insight.color }}
            >
              <Box className={"text-5xl font-[100] w-90 max-md:w-full"}>
                {insight.title}
              </Box>
              <Box className="text-[12px] leading-4">{insight.description}</Box>
            </Center>
          ))}
        </Center>

        <Center className="flex-col md:flex-row gap-6 w-full">
          {insightsDetails.slice(2, 4).map((insight, index) => (
            <Center
              key={index + 2}
              className={cn(
                "bg-[url(/insights/bg.svg)] bg-cover bg-center w-[30rem] max-sm:w-full h-70 rounded-lg flex flex-col p-4 text-white px-20  leading-5 text-start items-start gap-4"
              )}
              style={{ backgroundColor: insight.color }}
            >
              <Box className={"text-5xl font-[100] w-90 max-md:w-full"}>
                {insight.title}
              </Box>
              <Box className="text-[12px] leading-4">{insight.description}</Box>
            </Center>
          ))}
        </Center>
      </Box>
    </Center>
  );
};
