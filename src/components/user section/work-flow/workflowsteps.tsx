import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Flex } from "@/components/ui/flex";
import { Stack } from "@/components/ui/stack";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import {
  UserCheck,
  Users,
  FolderKanban,
  Clock,
  FileText,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserCheck,
    title: "Capture Leads",
    description:
      "Leads arrive via webhooks, contact forms or manual entry — automatically organised and ready to qualify.",
    color: "text-[#F98618]",
    bg: "bg-[#F98618]/10",
    border: "border-[#F98618]/20",
  },
  {
    number: "02",
    icon: Users,
    title: "Convert to Clients",
    description:
      "One click converts a qualified lead into a full client record with contacts, history and a dedicated portal.",
    color: "text-[#1797B9]",
    bg: "bg-[#1797B9]/10",
    border: "border-[#1797B9]/20",
  },
  {
    number: "03",
    icon: FolderKanban,
    title: "Plan & Execute",
    description:
      "Create projects, break them into tasks, assign your team and track every milestone — all in one board.",
    color: "text-[#9400FF]",
    bg: "bg-[#9400FF]/10",
    border: "border-[#9400FF]/20",
  },
  {
    number: "04",
    icon: Clock,
    title: "Track Time",
    description:
      "Log hours against tasks as you work. Every minute is recorded so nothing falls through the cracks at billing time.",
    color: "text-[#00C2FF]",
    bg: "bg-[#00C2FF]/10",
    border: "border-[#00C2FF]/20",
  },
  {
    number: "05",
    icon: FileText,
    title: "Invoice & Get Paid",
    description:
      "Turn tracked hours and approved work into a professional invoice in one click. Collect payment and close the loop.",
    color: "text-[#00A400]",
    bg: "bg-[#00A400]/10",
    border: "border-[#00A400]/20",
  },
];

export const WorkflowSteps = () => {
  const headingRef = useScrollReveal<HTMLDivElement>({ direction: "up" });
  const stepsDesktopRef = useScrollReveal<HTMLDivElement>({ direction: "up", delay: 0.1, stagger: 0.1 });
  const stepsMobileRef = useScrollReveal<HTMLDivElement>({ direction: "up", delay: 0.1, stagger: 0.08 });
  return (
    <Box className="w-full bg-card py-16 px-4">
      <Center ref={headingRef} className="flex-col gap-3 mb-12 text-center">
        <Box className="text-sm font-semibold text-[#F98618] uppercase tracking-widest">
          The Flowlio Workflow
        </Box>
        <Box className="text-4xl max-sm:text-2xl text-gray-800">
          <span className="font-[100]">Five steps,</span>{" "}
          <span className="font-semibold text-[#F98618]">one platform</span>
        </Box>
        <Box className="text-[15px] text-muted-foreground font-light max-w-lg">
          Every stage of your client work lives inside Flowlio — from the first
          enquiry to the final payment.
        </Box>
      </Center>

      <Center className="max-w-6xl mx-auto">
        {/* Desktop: horizontal steps */}
        <Flex ref={stepsDesktopRef} className="w-full items-start justify-between gap-2 max-lg:hidden">
          {steps.map((step, index) => (
            <Flex key={step.number} className="flex-1 items-start gap-2">
              <Stack className="flex-1 items-center text-center gap-3">
                {/* Icon circle */}
                <Box
                  className={`w-14 h-14 rounded-2xl ${step.bg} border ${step.border} flex items-center justify-center shrink-0`}
                >
                  <step.icon className={`h-6 w-6 ${step.color}`} />
                </Box>

                <Box className={`text-xs font-bold ${step.color} tracking-widest`}>
                  {step.number}
                </Box>

                <Box className="text-sm font-semibold text-gray-800">
                  {step.title}
                </Box>

                <Box className="text-xs text-muted-foreground leading-relaxed max-w-[160px]">
                  {step.description}
                </Box>
              </Stack>

              {/* Arrow connector */}
              {index < steps.length - 1 && (
                <Box className="mt-6 shrink-0 text-muted-foreground/40">
                  <ArrowRight className="h-5 w-5" />
                </Box>
              )}
            </Flex>
          ))}
        </Flex>

        {/* Mobile: vertical steps */}
        <Stack ref={stepsMobileRef} className="w-full gap-0 lg:hidden">
          {steps.map((step, index) => (
            <Flex key={step.number} className="items-start gap-4">
              {/* Left line */}
              <Stack className="items-center gap-0 shrink-0">
                <Box
                  className={`w-12 h-12 rounded-2xl ${step.bg} border ${step.border} flex items-center justify-center`}
                >
                  <step.icon className={`h-5 w-5 ${step.color}`} />
                </Box>
                {index < steps.length - 1 && (
                  <Box className="w-px h-10 bg-border mt-1" />
                )}
              </Stack>

              {/* Content */}
              <Stack className="gap-1 pb-8 flex-1">
                <Box className={`text-xs font-bold ${step.color} tracking-widest`}>
                  {step.number}
                </Box>
                <Box className="text-sm font-semibold text-gray-800">
                  {step.title}
                </Box>
                <Box className="text-xs text-muted-foreground leading-relaxed">
                  {step.description}
                </Box>
              </Stack>
            </Flex>
          ))}
        </Stack>
      </Center>
    </Box>
  );
};
