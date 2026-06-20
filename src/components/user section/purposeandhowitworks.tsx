import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Flex } from "@/components/ui/flex";
import { Stack } from "@/components/ui/stack";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
  UserCheck,
  FolderKanban,
  FileText,
  ArrowRight,
  Shield,
} from "lucide-react";
import { useNavigate } from "react-router";

const phases = [
  {
    icon: UserCheck,
    accent: "#1797B9",
    label: "Capture",
    title: "Win new clients",
    description:
      "Leads arrive from your website via webhook and land in your pipeline. Qualify them, attach notes and convert to a full client record in one click.",
  },
  {
    icon: FolderKanban,
    accent: "#F98618",
    label: "Deliver",
    title: "Run every project",
    description:
      "Create projects, break them into tasks, assign your team and track progress on a kanban board. Time tracking runs in the background so every hour is logged.",
  },
  {
    icon: FileText,
    accent: "#1D6B52",
    label: "Get paid",
    title: "Invoice and grow",
    description:
      "Turn tracked hours into professional invoices. Send them directly to the client, collect payment online and review your numbers in real-time reports.",
  },
];

export const PurposeAndHowItWorks = () => {
  const navigate = useNavigate();

  return (
    <Box className="w-full py-20 px-4">
      <Center className="max-w-6xl mx-auto">
        <Stack className="w-full gap-20">

          {/* ── How it works ── */}
          <Box>
            <Center className="flex-col text-center mb-14 gap-4">
              <p className="text-sm font-semibold tracking-widest uppercase text-[#F98618]">
                How it works
              </p>
              <h2 className="max-sm:text-3xl text-foreground text-5xl leading-tight">
                <span className="font-[100]">Three phases,</span>{" "}
                <span className="text-[#F98618] font-semibold">one platform</span>
              </h2>
              <p className="text-muted-foreground max-w-xl">
                Everything your team needs to go from first enquiry to final
                payment — without switching tools.
              </p>
            </Center>

            <Box className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-0 rounded-2xl overflow-hidden border border-border">
              {phases.map((phase, i) => (
                <Flex
                  key={phase.label}
                  className={`flex-col p-8 sm:p-10 gap-5 bg-card relative group transition-colors duration-300 hover:bg-muted/40 ${
                    i < phases.length - 1 ? "lg:border-r border-b lg:border-b-0 border-border" : ""
                  }`}
                >
                  {/* Accent top bar on hover */}
                  <Box
                    className="absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ backgroundColor: phase.accent }}
                  />

                  {/* Icon */}
                  <Box
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${phase.accent}15` }}
                  >
                    <phase.icon className="h-5 w-5" style={{ color: phase.accent }} />
                  </Box>

                  {/* Label */}
                  <p
                    className="text-xs font-bold tracking-widest uppercase"
                    style={{ color: phase.accent }}
                  >
                    {phase.label}
                  </p>

                  {/* Title */}
                  <h3 className="text-2xl font-semibold text-foreground leading-tight -mt-2">
                    {phase.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[15px] text-muted-foreground leading-relaxed">
                    {phase.description}
                  </p>
                </Flex>
              ))}
            </Box>

            {/* CTA */}
            <Center className="mt-10">
              <Button
                onClick={() => navigate("/pricing")}
                className="h-12 px-8 rounded-full bg-[#1797B9] hover:bg-[#1797B9]/85 text-white cursor-pointer gap-2 text-sm font-medium"
              >
                Start your free trial
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Center>
          </Box>

          {/* ── Data transparency note ── */}
          <Box className="max-w-3xl mx-auto w-full">
            <Flex className="gap-4 p-5 rounded-xl bg-muted/40 border border-border items-start">
              <Box className="p-2 rounded-lg bg-[#1797B9]/10 shrink-0 mt-0.5">
                <Shield className="h-4 w-4 text-[#1797B9]" />
              </Box>
              <Box>
                <p className="text-sm text-foreground leading-relaxed">
                  <span className="font-semibold">Your data stays yours.</span>{" "}
                  Flowlio integrates with Google Calendar for bidirectional event
                  sync. We only access your calendar data to keep events
                  synchronised — nothing is shared with third parties. Read our{" "}
                  <Link
                    to="/privacy-policy"
                    className="text-[#1797B9] hover:underline font-medium"
                  >
                    Privacy Policy
                  </Link>{" "}
                  for full details.
                </p>
              </Box>
            </Flex>
          </Box>

        </Stack>
      </Center>
    </Box>
  );
};
