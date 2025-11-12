import { cn } from "@/lib/utils";
import { Box } from "../ui/box";
import { Center } from "../ui/center";
import { Flex } from "../ui/flex";
import { useState, useRef, useEffect } from "react";

export const TeamMember = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const teamMembers = [
    {
      name: "Jessy Pinkman",
      image: "/home/team1.svg",
    },
    {
      name: "Dotizion Lead",
      image: "/home/team2.svg",
    },
    {
      name: "Will Betehiem",
      image: "/home/team3.svg",
    },
  ];

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    const diff = startX - currentX;
    const threshold = 50; // minimum distance to trigger slide

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentIndex < teamMembers.length - 1) {
        // Swipe left - next slide
        setCurrentIndex((prev) => prev + 1);
      } else if (diff < 0 && currentIndex > 0) {
        // Swipe right - previous slide
        setCurrentIndex((prev) => prev - 1);
      }
    }

    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setCurrentX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setCurrentX(e.clientX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    const diff = startX - currentX;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentIndex < teamMembers.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else if (diff < 0 && currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
      }
    }

    setIsDragging(false);
  };

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

      <Box className="bg-[#4E43C3] w-5xl h-[26rem] max-lg:w-full max-md:h-full p-4 relative mt-34 max-sm:mt-10 z-20 rounded-2xl">
        <Center className="bg-[#6255FA] flex-col w-full h-full p-4 rounded-2xl relative">
          {/* Desktop Layout */}
          <Center className="relative -mt-40 max-sm:hidden w-[40rem] h-full gap-4 ">
            {teamMembers.map((member, index) => (
              <Flex
                key={member.name}
                className={`flex-col text-center bg-white p-3 rounded-lg ${
                  index === 1 && "-mt-14 shadow-2xl shadow-black/40 "
                }`}
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className={cn(`size-40`, index === 1 && "size-55")}
                />
                <h1 className="my-2">{member.name}</h1>
              </Flex>
            ))}
          </Center>

          {/* Mobile Touch Slider */}
          <Box className="hidden max-sm:block w-[22rem] h-full relative overflow-hidden">
            <div
              ref={sliderRef}
              className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <div className="relative w-full max-w-sm">
                <div className="overflow-hidden rounded-2xl">
                  <div
                    className="flex transition-transform duration-300 ease-out"
                    style={{
                      transform: `translateX(-${currentIndex * 100}%)`,
                      cursor: isDragging ? "grabbing" : "grab",
                    }}
                  >
                    {teamMembers.map((member, index) => (
                      <Center
                        key={member.name}
                        className="w-full flex-shrink-0 px-2"
                      >
                        <Flex
                          className={`flex-col w-[16rem] h-[18rem] text-center bg-white p-3 rounded-lg ${
                            index === 1 && "-mt-0 shadow-2xl shadow-black/40"
                          }`}
                          style={{
                            userSelect: "none",
                          }}
                        >
                          <img
                            src={member.image}
                            alt={member.name}
                            className={cn(`size-50`)}
                          />
                          <h1 className="my-2">{member.name}</h1>
                        </Flex>
                      </Center>
                    ))}
                  </div>
                </div>

                {/* Dots Indicator */}
                <Flex className="justify-center mt-6 gap-2">
                  {teamMembers.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={cn(
                        "size-2 rounded-full transition-all duration-300",
                        currentIndex === index
                          ? "bg-white scale-125"
                          : "bg-white/40 hover:bg-white/60"
                      )}
                    />
                  ))}
                </Flex>
              </div>
            </div>
          </Box>

          <Center className="gap-2 flex-col text-center w-full max-sm:mt-10">
            <Flex>
              <h1 className="text-white font-semibold text-2xl">
                Meet the Minds Behind Dotiziion
              </h1>
              <img
                src="/home/stardot.svg"
                alt="star"
                className="size-5 fill-white"
              />
            </Flex>

            <h1 className="text-white text-lg font-extralight w-4xl max-lg:w-full">
              Our leadership team brings together years of experience in product
              innovation, teamwork, and execution—committed to helping your
              business run smarter.
            </h1>
          </Center>
        </Center>
      </Box>
    </Center>
  );
};
