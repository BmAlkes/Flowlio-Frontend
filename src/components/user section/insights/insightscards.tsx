import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { cn } from "@/lib/utils";

export const InsightsCards = () => {
  const insightsDetails = [
    {
      title: "All Your Data, One Dashboard",
      description:
        "See project progress, task completion, invoice totals and team activity in one place — updated in real time. No spreadsheets, no chasing updates.",
      color: "#DED4FC",
    },
    {
      title: "Time & Revenue at a Glance",
      description:
        "Connect hours logged to projects and billable amounts. Instantly see where your team’s time goes and which clients drive the most revenue.",
      color: "#73D5A4",
    },
    {
      title: "Team Performance Reports",
      description:
        "Track task completion rates, on-time delivery and workload per team member. Spot bottlenecks and overloaded teammates before they affect your deadlines.",
      color: "#333333",
    },
    {
      title: "Compare & Improve",
      description:
        "Compare projects, time periods or team members side by side. Spot what’s working, cut what isn’t and make every decision backed by real numbers.",
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
