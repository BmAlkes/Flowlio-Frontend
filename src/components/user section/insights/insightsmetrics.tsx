import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Flex } from "@/components/ui/flex";
import {
  FolderKanban,
  Clock,
  FileText,
  Users,
  UserCheck,
  TrendingUp,
} from "lucide-react";

const metrics = [
  {
    icon: FolderKanban,
    color: "#1797B9",
    bg: "bg-[#1797B9]/10",
    title: "Project Completion Rate",
    description:
      "See which projects are on track and which are falling behind — updated in real time. Catch delays before the client does.",
  },
  {
    icon: Clock,
    color: "#F98618",
    bg: "bg-[#F98618]/10",
    title: "Billable Hours vs. Budget",
    description:
      "Compare hours logged against estimated time per project. Spot scope creep early and protect your margins on every engagement.",
  },
  {
    icon: FileText,
    color: "#00A400",
    bg: "bg-[#00A400]/10",
    title: "Revenue & Invoice Totals",
    description:
      "Track monthly revenue, outstanding invoices and payment history in one view. Know exactly what's been paid and what's still owed.",
  },
  {
    icon: Users,
    color: "#9400FF",
    bg: "bg-[#9400FF]/10",
    title: "Team Workload",
    description:
      "See task distribution across your team. Identify who's at capacity, who has room for more and where bottlenecks are forming.",
  },
  {
    icon: UserCheck,
    color: "#FF596D",
    bg: "bg-[#FF596D]/10",
    title: "Lead Conversion Rate",
    description:
      "Know how many leads become paying clients and how long conversion takes on average. Measure the health of your pipeline.",
  },
  {
    icon: TrendingUp,
    color: "#00C2FF",
    bg: "bg-[#00C2FF]/10",
    title: "Client Activity",
    description:
      "See which clients are most active, what was last delivered, upcoming deadlines and open proposals — all in one place.",
  },
];

export const InsightsMetrics = () => {
  return (
    <Center className="relative p-8 sm:p-8 mb-12">
      <Box className="relative z-10 max-w-5xl w-full my-14">

        {/* Heading */}
        <Flex className="items-start justify-start text-start flex-col gap-6 ml-6 mb-10">
          <h2 className="font-[100] sm:text-5xl text-3xl max-lg:w-full max-sm:text-center">
            Measure Everything{" "}
            <span className="text-[#F98618] font-semibold">That Matters</span>
          </h2>
          <p className="text-base text-foreground font-light leading-6 max-w-[40rem] max-md:w-full">
            Six metrics your business can't afford to ignore — all tracked
            automatically inside Flowlio, no manual reports needed.
          </p>
        </Flex>

        {/* Metrics grid */}
        <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1 px-4 sm:px-6">
          {metrics.map((m) => (
            <Flex
              key={m.title}
              className="flex-col items-start gap-3 p-6 rounded-2xl border border-border bg-card hover:shadow-md transition-shadow duration-200"
            >
              <Box className={`p-2.5 rounded-xl ${m.bg} shrink-0`}>
                <m.icon
                  className="h-5 w-5"
                  style={{ color: m.color }}
                />
              </Box>
              <h3 className="text-base font-semibold text-foreground leading-tight">
                {m.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-light">
                {m.description}
              </p>
            </Flex>
          ))}
        </div>

      </Box>
    </Center>
  );
};
