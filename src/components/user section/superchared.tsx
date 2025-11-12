import { Box } from "../ui/box";
import { useRef, useEffect } from "react";
import { Center } from "../ui/center";
import { Flex } from "../ui/flex";
import { cn } from "@/lib/utils";

const cards = [
  {
    title: "Team Collaboration",
    desc: "Centralized chat, mentions & file sharing ",
    brand: "dotvizion Management",
    brandLogo: "/home/dotvizionwithtext.svg ",
    bg: "bg-[#9400FF]",
  },
  {
    title: "Project Planning ",
    desc: "Timeline, milestones & dependencies ",
    brand: "dotvizion Management",
    brandLogo: "/home/dotvizionwithtext.svg",
    bg: "bg-[#F98618]",
  },
  {
    title: "Task Automation",
    desc: "Automate repetitive tasks easily ",
    brand: "dotvizion Management",
    brandLogo: "/home/dotvizionwithtext.svg",
    bg: "bg-[#00C2FF]",
  },
  {
    title: "Resource Management",
    desc: "Allocate & track resources smartly ",
    brand: "dotvizion Management",
    brandLogo: "/home/dotvizionwithtext.svg",
    bg: "bg-[#00FF85]",
  },
  {
    title: "Analytics Reports",
    desc: "Visualize progress & performance ",
    brand: "dotvizion Management",
    brandLogo: "/home/dotvizionwithtext.svg",
    bg: "bg-[#FF61C7]",
  },
  {
    title: "HR Attendance",
    desc: "Manage employees & attendance ",
    brand: "dotvizion Management",
    brandLogo: "/home/dotvizionwithtext.svg",
    bg: "bg-[#65d97a]",
  },
  {
    title: "Custom Integrations",
    desc: "Connect your favorite tools",
    brand: "dotvizion Management",
    brandLogo: "/home/dotvizionwithtext.svg",
    bg: "bg-[#3333FF]",
  },
];

type SupercharedProps = {
  isWorkFlow?: boolean;
};

export const Superchared = ({ isWorkFlow }: SupercharedProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll animation
  useEffect(() => {
    if (!scrollRef.current) return;

    const scrollContainer = scrollRef.current;
    let animationId: number;
    let scrollPosition = 0;
    const scrollSpeed = 1;

    const animate = () => {
      if (scrollContainer) {
        scrollPosition += scrollSpeed;
        if (scrollPosition >= scrollContainer.scrollWidth / 2) {
          scrollPosition = 0;
        }
        scrollContainer.scrollLeft = scrollPosition;
      }
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  // Duplicate cards for seamless scroll
  const allCards = [...cards, ...cards];

  return (
    <Box
      className={cn(
        "w-full relative max-sm:mt-0  bg-white z-[20]",
        isWorkFlow === false ? "-mt-70" : "-mt-10"
      )}
    >
      {isWorkFlow === false && (
        <>
          <img
            src="/home/graydot.svg"
            alt="dot"
            className="size-20 absolute left-18 max-sm:hidden"
          />

          <Center className="flex-col gap-2 text-center bg-white p-8">
            <Box className="text-5xl font-[100] text-[#333333] max-sm:text-2xl">
              Your Workflow,
              <span className="text-[#F98618] font-semibold ">
                Supercharged
              </span>
            </Box>
            <Box className="font-light text-[#333333] text-md max-sm:text-sm text-center">
              Tailored modules for every department — pick what fits your
              workflow.
            </Box>
          </Center>
        </>
      )}

      <Center className="w-full h-full bg-white">
        <Box className="relative w-full overflow-hidden select-none">
          {/* Left brush effect */}
          <Box className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />

          {/* Right brush effect */}
          <Box className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          <Center
            ref={scrollRef}
            className="overflow-hidden min-w-[1200px] gap-8 p-18 group cursor-grab"
          >
            {allCards.map((card, i) => (
              <Flex
                key={i}
                className={`min-w-[240px] max-w-[260px] h-[270px] rounded-2xl p-6 flex-col justify-between shadow-lg ${card.bg} text-white relative`}
              >
                <Box>
                  <Box className="text-xl font-light leading-tight mb-2">
                    {card.title.split(" ").map((word, i) => (
                      <span key={i} className="block">
                        {word}
                      </span>
                    ))}
                  </Box>

                  <Flex className="text-sm font-light mt-4  items-center">
                    <p>{card.desc}</p>
                    <img
                      src="/home/stardot.svg"
                      alt="arrow"
                      className="size-5"
                    />
                  </Flex>
                </Box>
                <Flex className="absolute bottom-0 left-6 items-center gap-2">
                  <img src={card.brandLogo} alt="logo" className="size-24" />
                </Flex>
              </Flex>
            ))}
          </Center>
        </Box>
      </Center>
    </Box>
  );
};
