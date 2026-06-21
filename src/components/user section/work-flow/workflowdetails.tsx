import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { cn } from "@/lib/utils";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export const WorkflowdDetails = () => {
  const s1 = useScrollReveal<HTMLDivElement>({ direction: "left", distance: 40 });
  const s2 = useScrollReveal<HTMLDivElement>({ direction: "right", distance: 40 });
  const s3 = useScrollReveal<HTMLDivElement>({ direction: "left", distance: 40 });
  const s4 = useScrollReveal<HTMLDivElement>({ direction: "right", distance: 40 });
  return (
    <Center className="max-w-6xl max-lg:w-full flex-col mx-auto h-full overflow-hidden bg-card px-2 py-12">
      {/* Section 1 — Leads & Clients */}
      <Center ref={s1} className={`gap-8 py-12 px-4 max-sm:flex-col max-sm:items-start`}>
        <Box className="flex-1 max-w-md">
          <Box className={cn(`text-5xl text-gray-800 mb-4`)}>
            <span className="text-gray-800 font-[100]">Capture Leads,</span>
            <span className=" text-[#F98618] font-semibold"> Win Clients </span>
          </Box>
          <Box className="text-[15px] text-muted-foreground leading-6">
            Connect your website forms and landing pages to Flowlio via webhook — every enquiry lands directly in your pipeline, tagged and ready to qualify. When the time is right, convert the lead to a full client record in one click. No copy-pasting, no lost contacts.
          </Box>
        </Box>
        <Box className="flex-1 flex justify-center max-sm:mt-4">
          <img
            src={"/workflow/img1.svg"}
            alt={"Capture Leads, Win Clients"}
            className="max-w-lg w-full h-auto"
          />
        </Box>
      </Center>

      {/* Section 2 — Projects & Tasks */}
      <Center
        ref={s2}
        className={`gap-8 py-12 px-4 max-sm:flex-col-reverse max-sm:items-stretch`}
      >
        <Box className="flex-1 flex justify-center max-sm:mt-4">
          <img
            src={"/workflow/img2.svg"}
            alt={"Plan Projects, Assign Tasks"}
            className="max-w-lg w-full h-auto"
          />
        </Box>
        <Box className="flex-1 max-w-md">
          <Box className={cn(`text-5xl text-gray-800 mb-4`)}>
            <span className="text-gray-800 font-[100]">Plan Projects,</span>
            <span className=" text-[#F98618] font-semibold"> Assign Tasks </span>
          </Box>
          <Box className="text-[15px] text-muted-foreground leading-6 max-w-[21rem]">
            Break every client engagement into a structured project. Set milestones, assign tasks with due dates, and watch progress in real time on a kanban board. Your whole team stays aligned — from kick-off to delivery — without a single status meeting.
          </Box>
        </Box>
      </Center>

      {/* Section 3 — Time Tracking & Invoicing */}
      <Center
        ref={s3}
        className={`gap-8 py-12 px-4 max-sm:flex-col max-sm:items-stretch`}
      >
        <Box className="flex-1 max-w-md">
          <Box className={cn(`text-5xl text-gray-800 mb-4`)}>
            <span className="text-gray-800 font-[100]">Track Time,</span>
            <span className=" text-[#F98618] font-semibold"> Get Paid </span>
            <span className="text-gray-800 font-[100]">Faster</span>
          </Box>
          <Box className="text-[15px] text-muted-foreground leading-6 max-w-[22rem]">
            Log hours against tasks as you work. When the job is done, generate a professional invoice in one click — with every billable minute already accounted for. Send it directly to the client, collect payment online and mark it paid, all inside Flowlio.
          </Box>
        </Box>
        <Box className="flex-1 flex justify-center max-sm:mt-4">
          <img
            src={"/workflow/img3.svg"}
            alt={"Track Time, Get Paid Faster"}
            className="max-w-lg w-full h-auto"
          />
        </Box>
      </Center>

      {/* Section 4 — Analytics & AI */}
      <Center
        ref={s4}
        className={`gap-8 py-12 px-4 max-sm:flex-col-reverse max-sm:items-stretch`}
      >
        <Box className="flex-1 flex justify-center max-sm:mt-4">
          <img
            src={"/workflow/img4.svg"}
            alt={"Analyse Results, Grow Smarter"}
            className="max-w-lg w-full h-auto"
          />
        </Box>
        <Box className="flex-1 max-w-md">
          <Box
            className={cn(
              `text-5xl text-gray-800 mb-4 w-[26rem] max-lg:w-full`
            )}
          >
            <span className="text-gray-800 font-[100]">Analyse Results, </span>
            <span className=" text-[#F98618] font-semibold">Grow </span>
            <span className="text-gray-800 font-[100]">Smarter</span>
          </Box>
          <Box className="text-[15px] text-muted-foreground leading-6 max-w-[22rem]">
            Built-in reports surface team performance, invoice totals and project utilisation at a glance. The AI assistant helps draft proposals, answer client questions and surface what needs attention next — so every decision is backed by data, not guesswork.
          </Box>
        </Box>
      </Center>
    </Center>
  );
};
