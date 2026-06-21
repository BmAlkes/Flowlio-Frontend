import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Flex } from "@/components/ui/flex";
import { useScrollReveal } from "@/hooks/useScrollReveal";
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
    accent: "#1797B9",
    title: "Project Completion Rate",
    description:
      "See which projects are on track and which are falling behind — updated in real time. Catch delays before the client does.",
    span: "col-span-1",
  },
  {
    icon: Clock,
    accent: "#F98618",
    title: "Billable Hours vs. Budget",
    description:
      "Compare hours logged against estimated time per project. Spot scope creep early and protect your margins on every engagement.",
    span: "col-span-1 lg:col-span-2",
  },
  {
    icon: FileText,
    accent: "#1D6B52",
    title: "Revenue & Invoice Totals",
    description:
      "Track monthly revenue, outstanding invoices and payment history in one view. Know exactly what's been paid and what's still owed.",
    span: "col-span-1 lg:col-span-2",
  },
  {
    icon: Users,
    accent: "#6E42C1",
    title: "Team Workload",
    description:
      "See task distribution across your team. Identify who's at capacity, who has room for more and where bottlenecks are forming.",
    span: "col-span-1",
  },
  {
    icon: UserCheck,
    accent: "#D14B59",
    title: "Lead Conversion Rate",
    description:
      "Know how many leads become paying clients and how long conversion takes on average. Measure the health of your pipeline.",
    span: "col-span-1",
  },
  {
    icon: TrendingUp,
    accent: "#0E7490",
    title: "Client Activity",
    description:
      "See which clients are most active, what was last delivered, upcoming deadlines and open proposals — all in one place.",
    span: "col-span-1",
  },
];

export const InsightsMetrics = () => {
  const headingRef = useScrollReveal<HTMLDivElement>({ direction: "up" });
  const gridRef = useScrollReveal<HTMLDivElement>({ direction: "up", delay: 0.15, stagger: 0.08 });

  return (
    <Center className="relative px-4 sm:px-8 mb-16">
      <Box className="relative z-10 max-w-5xl w-full mt-14">

        {/* ── Heading ── */}
        <Box ref={headingRef} className="ml-2 sm:ml-6 mb-12">
          <p className="text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: "#F98618" }}>
            What you can measure
          </p>
          <h2 className="text-4xl sm:text-5xl text-foreground leading-tight">
            <span className="font-[100]">The numbers that</span>
            <br className="hidden sm:block" />
            <span className="font-semibold" style={{ color: "#F98618" }}> drive your business</span>
          </h2>
        </Box>

        {/* ── Bento grid ── */}
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 px-0 sm:px-2">
          {metrics.map((m) => (
            <Box
              key={m.title}
              className={`group relative rounded-2xl p-6 sm:p-7 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${m.span}`}
              style={{ backgroundColor: `${m.accent}0A` }}
            >
              {/* Accent bar */}
              <Box
                className="absolute left-0 top-0 w-1 h-full rounded-l-2xl"
                style={{ backgroundColor: m.accent }}
              />

              {/* Decorative corner glow */}
              <Box
                className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-[0.06] group-hover:opacity-[0.12] transition-opacity duration-500"
                style={{ backgroundColor: m.accent }}
              />

              <Flex className="flex-col items-start gap-4 relative">
                {/* Icon */}
                <Box
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${m.accent}18` }}
                >
                  <m.icon className="h-5 w-5" style={{ color: m.accent }} />
                </Box>

                {/* Title */}
                <h3 className="text-lg font-semibold text-foreground leading-snug">
                  {m.title}
                </h3>

                {/* Description */}
                <p className="text-[15px] text-muted-foreground leading-relaxed">
                  {m.description}
                </p>
              </Flex>
            </Box>
          ))}
        </div>

      </Box>
    </Center>
  );
};
