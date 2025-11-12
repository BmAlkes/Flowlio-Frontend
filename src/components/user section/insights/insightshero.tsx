import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Stack } from "@/components/ui/stack";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";

export const InsightsHero = () => {
  const navigate = useNavigate();

  return (
    <Box className="relative w-full h-[32rem] z-[40] bg-[#161616] overflow-hidden">
      <Box className="w-full h-screen bg-[url(/workflow/workflow-bg.svg)] bg-cover bg-center absolute top-0 left-0 -z-10 opacity-50"></Box>

      <Box className="w-full h-screen bg-[url(/workflow/workflow-bg2.png)] bg-cover bg-center absolute top-0 max-lg:-top-20 left-0 -z-10"></Box>

      <Center className="items-center justify-center text-center gap-2">
        <img src="/home/dotvizion.svg" alt="logo" className="size-24" />
      </Center>

      <Center className="px-2">
        <Stack className="text-center max-sm:w-full justify-between items-center">
          <Box className="text-[#F98618] font-semibold max-w-2xl max-sm:w-full text-5xl max-sm:text-3xl  ">
            Make Smarter Decisions
            <Box className="text-white font-[100]">
              with Actionable Insights
            </Box>
          </Box>
          <Box className="w-2xl max-sm:w-full font-[200] text-white text-[15px]">
            Uncover patterns, track team performance, and drive efficiency with
            real-time data designed for modern teams.
          </Box>
          <Button
            onClick={() => navigate("/pricing")}
            className="p-2 mt-2 h-12 w-36 rounded-3xl bg-[#1797B9] cursor-pointer hover:bg-[#1797B9]/80"
          >
            Get Started
            <ArrowRight />
          </Button>
        </Stack>
      </Center>
    </Box>
  );
};
