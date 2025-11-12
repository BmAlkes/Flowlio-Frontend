import { Box } from "../ui/box";
import { Center } from "../ui/center";
import { Flex } from "../ui/flex";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";

export const TeamMember2 = () => {
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const handleMouseLeave = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [isDragging]);

  return (
    <Center className="flex-col w-full h-full px-4 py-14 bg-black relative overflow-hidden z-30">
      <Box className="bg-[url(/home/grid.png)] bg-contain bg-center bg-no-repeat z-10 w-full h-[40rem] absolute top-10 max-sm:top-0 left-0"></Box>

      <Center className="p-2 flex-col gap-2 text-5xl font-[100] max-sm:text-2xl text-white text-center  ">
        <h1>
          A Team That
          <span className="text-[#F98618] font-semibold "> Works </span>
          With You,
        </h1>
        <h1>Not Just For You</h1>
      </Center>

      <Center className="max-md:flex-col">
        <img
          src="/home/calenderimg.svg"
          alt="calender"
          className="size-120 z-20"
        />
        <Box className="bg-[#4E43C3] w-md h-[22rem] max-lg:w-full max-md:h-full p-2 max-sm:mt-10 z-20 rounded-2xl">
          <Center className="bg-[#6255FA] flex-col w-full h-full p-4 rounded-2xl overflow-hidden">
            <Center className="gap-5 flex-col text-start items-start w-full max-sm:mt-10">
              <Flex className="gap-0 w-60">
                <h1 className="text-white font-[100] text-5xl max-sm:text-3xl">
                  Meet the Minds Behind
                  <span className="text-[#F98618] text-5xl max-sm:text-3xl font-semibold ml-1">
                    Dotvizion
                  </span>
                </h1>
              </Flex>

              <h1 className="text-white text-[17px] font-extralight w-sm leading-5 text-start max-lg:w-full">
                Our leadership team brings together decades of hands-on
                experience in product innovation, strategic collaboration, and
                flawless execution—fully committed to helping your business
                operate smarter, faster, and more efficiently.
              </h1>

              <Button
                onClick={() => {
                  navigate("/pricing");
                }}
                className="rounded-full w-33 h-11 cursor-pointer hover:transform hover:scale-105 transition-all duration-300  hover:bg-white hover:text-black"
              >
                Get Started <ArrowRight />
              </Button>
            </Center>
          </Center>
        </Box>
      </Center>
    </Center>
  );
};
