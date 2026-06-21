import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Stack } from "@/components/ui/stack";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";

export const Hero = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.from(headingRef.current, { opacity: 0, y: 30, duration: 0.9 })
      .from(descRef.current, { opacity: 0, y: 20, duration: 0.7 }, "-=0.4")
      .from(ctaRef.current, { opacity: 0, y: 15, duration: 0.5 }, "-=0.3")
      .from(imageRef.current, { opacity: 0, y: 40, scale: 0.97, duration: 1 }, "-=0.4");

    return () => { tl.kill(); };
  }, []);

  return (
    <Box ref={containerRef} className="relative w-full h-full z-[10]">
      <Box className="w-full h-screen bg-[url(/home/blocks2.png)] bg-cover bg-center absolute top-0 left-0" />
      <Box className="absolute -z-10 top-110 right-0 w-40 h-100 bg-[#2B2BA0]/50 blur-3xl opacity-20" />

      <Center className="items-center justify-center text-center gap-2">
        <img
          src="/home/dotvizion.svg"
          alt="logo"
          className="size-36"
          onClick={() => navigate("https://www.dotvizion.com")}
        />
        <Box className="text-[14px] text-muted-foreground font-normal pb-2">
          work platform
        </Box>
      </Center>

      <Center className="-mt-2 px-2 relative z-[40]">
        <Stack className="text-center max-sm:w-full justify-between items-center">
          <div ref={headingRef}>
            <Box className="max-w-2xl max-sm:w-full text-6xl max-sm:text-3xl font-[100] text-[#333333]">
              Work
              <span className="text-[#F98618] font-semibold"> Better,</span> Track
              Faster, Grow Stronger
            </Box>
          </div>

          <div ref={descRef}>
            <Box className="w-xl max-sm:w-full mt-4 font-normal text-foreground text-[16px] max-sm:text-[16px] leading-relaxed">
              Flowlio is a comprehensive work management and productivity platform
              designed to help individuals, teams, and organizations streamline
              their workflow processes, manage tasks and projects, track time, and
              synchronize with Google Calendar.
            </Box>
            <Box className="w-xl max-sm:w-full mt-3 font-normal text-muted-foreground text-[15px] leading-relaxed">
              Our platform enables you to create and manage tasks, organize
              projects, track work hours with precision, and seamlessly sync
              calendar events with Google Calendar through bidirectional
              synchronization. Flowlio also provides AI-enhanced insights to
              optimize your workflow efficiency and boost team performance.
            </Box>
          </div>

          <div ref={ctaRef}>
            <Button
              onClick={() => navigate("/pricing")}
              className="p-2 mt-4 h-12 w-36 rounded-3xl bg-[#1797B9] cursor-pointer hover:bg-[#1797B9]/80"
            >
              Get Started
              <ArrowRight />
            </Button>
          </div>

          <div ref={imageRef} className="relative max-sm:mt-10 w-full gap-0 px-2">
            <img
              src="/home/robo.svg"
              alt="hero"
              className="size-34 absolute right-16 -top-18"
            />
            <img src="/home/dash.png" alt="hero" className="w-4xl mt-8" />
            <img
              src="/home/brain.svg"
              alt="hero"
              className="size-35 absolute bottom-64 -left-11 max-sm:hidden"
            />
          </div>
        </Stack>
      </Center>
    </Box>
  );
};
