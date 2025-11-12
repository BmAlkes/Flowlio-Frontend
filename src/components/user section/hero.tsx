import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Flex } from "@/components/ui/flex";
import { Stack } from "@/components/ui/stack";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <Box className="relative w-full h-full z-[10]">
      <Box className="w-full h-screen bg-[url(/home/blocks2.png)] bg-cover bg-center absolute top-0 left-0"></Box>
      {/* <Box className="absolute -z-10 top-110 right-0 w-40 h-100 bg-[#2B2BA0]/50 blur-3xl opacity-20 " /> */}
      <Box className="absolute -z-10 top-110 right-0 w-40 h-100 bg-[#2B2BA0]/50 blur-3xl opacity-20 " />

      <Center className="items-center justify-center text-center gap-2">
        <img src="/home/dotvizion.svg" alt="logo" className="size-30" />
        <Box className="text-[14px] text-gray-600 font-normal pb-2">
          work platform
        </Box>
      </Center>

      <Center className="-mt-2 px-2 relative z-[40]">
        <Stack className="text-center max-sm:w-full justify-between items-center">
          <Box className="max-w-2xl max-sm:w-full text-6xl max-sm:text-3xl font-[100] text-[#333333]">
            Work
            <span className="text-[#F98618] font-semibold"> Better,</span> Track
            Faster, Grow Stronger
          </Box>
          <Box className="w-xl max-sm:w-full mt-2 font-normal text-gray-600 text-[15px]">
            Streamline your client and project workflows, track time with
            precision, and boost team performance — all from one powerful,
            AI-enhanced platform.
          </Box>
          <Button
            onClick={() => navigate("/pricing")}
            className="p-2 mt-4 h-12 w-36 rounded-3xl bg-[#1797B9] cursor-pointer hover:bg-[#1797B9]/80"
          >
            Get Started
            <ArrowRight />
          </Button>

          <Flex className="mt-4 max-sm:flex-col">
            <Box className="text-[16px] text-gray-600 font-light">
              No credit card needed
            </Box>
            <img src="/home/star.svg" alt="star" className="size-4" />
            <Box className="text-[16px] text-gray-600 font-light">
              Unlimited time on free plan
            </Box>
          </Flex>

          <Box className="relative mt-2 max-sm:mt-10 w-full gap-0 px-2">
            <img
              src="/home/robo.svg"
              alt="hero"
              className="size-34 absolute right-16 -top-12"
            />
            <img src="/home/dash.png" alt="hero" className="w-4xl mt-14" />

            <img
              src="/home/brain.svg"
              alt="hero"
              className="size-35 absolute bottom-64 -left-11 max-sm:hidden"
            />
          </Box>
        </Stack>
      </Center>
    </Box>
  );
};
