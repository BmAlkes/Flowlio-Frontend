import { Box } from "../ui/box";
import { Button } from "../ui/button";
import { Center } from "../ui/center";
import { Flex } from "../ui/flex";

export const ManageTask = () => {
  return (
    <Box className="w-full h-full relative">
      <img
        src="/home/graydot.svg"
        alt=""
        className="z-40 size-28 absolute -top-20 right-15"
      />

      <Box className="relative z-30 overflow-hidden mt-10 px-4">
        <Box className="bg-[url(/home/manageblock1.png)] bg-cover bg-center bg-no-repeat z-10 w-full h-full absolute top-0 left-0" />

        <Flex className="justify-center w-full mx-auto gap-4 items-center max-sm:flex-col relative z-30">
          <Center className="items-start gap-6 w-md max-sm:w-full p-2 flex-col text-5xl font-[100] max-sm:text-2xl text-white  ">
            <h1 className="text-black max-sm:text-center">
              Manage All Your Team’s
              <span className="text-[#F98618] font-semibold ">
                {" "}
                Daily Task{" "}
              </span>
              More Efficiently
            </h1>
            <p className="text-black font-light text-sm drop-shadow-3xl">
              Start building and developing your team by starting to manage your
              team work system. And create a comfortable and easy collaboration
              atmosphere.
            </p>

            <Button className="p-2 h-11 w-34 rounded-3xl bg-[#1797B9] cursor-pointer hover:bg-[#1797B9]/80">
              Learn More
            </Button>
          </Center>
          <img
            src="/home/cards.svg"
            alt="cards"
            className="size-130 z-40 max-sm:size-90"
          />
        </Flex>
      </Box>

      <Flex className="relative z-30 w-full h-full max-sm:flex-col-reverse px-4">
        <Box className="bg-[url(/home/managelock2.png)] bg-cover bg-center bg-no-repeat z-10 w-full h-full absolute top-0 left-0" />

        <Flex className=" justify-center w-full mx-auto gap-8 items-center max-sm:flex-col relative z-30 mb-12">
          <img
            src="/home/cards2.svg"
            alt="cards"
            className="size-120 z-40 max-sm:size-90"
          />
          <Center className="items-start gap-6 w-md max-sm:w-full p-2 flex-col text-5xl font-[100] max-sm:text-2xl text-white  ">
            <h1 className="text-black max-sm:text-center">
              How Important It Is For You To Stay
              <span className="text-[#F98618] font-semibold "> Flexible</span>
            </h1>
            <p className="text-black font-light text-sm drop-shadow-3xl">
              Define doesn’t just fill up your entire calendar and present you
              from being available. Instead define will dynamically shift events
              from free to busy on it notices.
            </p>
            <p className="text-black font-light text-sm drop-shadow-3xl">
              Define doesn’t just fill up your entire calendar and present you
              from being available instead define will dynamically shift events.
            </p>

            <Button className="p-2 h-11 w-34 rounded-3xl bg-[#1797B9] cursor-pointer hover:bg-[#1797B9]/80">
              Learn More
            </Button>
          </Center>
        </Flex>
      </Flex>
    </Box>
  );
};
