import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Stack } from "@/components/ui/stack";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";

export const InsightsHero = () => {
  const navigate = useNavigate();
  const headRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(headRef.current, { opacity: 0, y: 25, duration: 0.8 })
      .from(subRef.current, { opacity: 0, y: 15, duration: 0.6 }, "-=0.3")
      .from(ctaRef.current, { opacity: 0, y: 10, duration: 0.5 }, "-=0.2");
    return () => { tl.kill(); };
  }, []);

  return (
    <Box className="relative w-full h-[32rem] z-[40] bg-[#161616] overflow-hidden">
      <Box className="w-full h-screen bg-[url(/workflow/workflow-bg.svg)] bg-cover bg-center absolute top-0 left-0 -z-10 opacity-50"></Box>

      <Box className="w-full h-screen bg-[url(/workflow/workflow-bg2.png)] bg-cover bg-center absolute top-0 max-lg:-top-20 left-0 -z-10"></Box>

      <Center className="items-center justify-center text-center gap-2">
        <img src="/home/dotvizion.svg" alt="logo" className="size-24" />
      </Center>

      <Center className="px-2">
        <Stack className="text-center max-sm:w-full justify-between items-center">
          <div ref={headRef}>
            <Box className="text-[#F98618] font-semibold max-w-2xl max-sm:w-full text-5xl max-sm:text-3xl  ">
              See Exactly What's
              <Box className="text-white font-[100]">
                Happening in Your Business
              </Box>
            </Box>
          </div>
          <div ref={subRef}>
            <Box className="w-2xl max-sm:w-full font-[200] text-white text-[15px]">
              Project progress, team performance, revenue and time — all tracked
              in one place and updated in real time.
            </Box>
          </div>
          <Button
            ref={ctaRef}
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
