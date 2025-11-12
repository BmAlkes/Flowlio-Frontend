import { Box } from "../ui/box";
import { Flex } from "../ui/flex";
import { Input } from "../ui/input";
import { Stack } from "../ui/stack";

export const SubscribeTo = () => {
  return (
    <Box className="p-14 w-full h-full bg-[url(/home/material.png)] bg-cover bg-center bg-no-repeat max-sm:p-10">
      <Flex className="px-4 justify-between items-center w-full mx-auto max-w-5xl max-lg:flex-col max-sm:px-0">
        <Flex className="max-w-4xl flex-col gap-0 items-start max-sm:items-center leading-2 text-white font-[200] text-4xl max-sm:text-xl max-sm:text-center">
          <h1>Streamline Your </h1>
          <h1>
            Content Creation with
            <span className="font-semibold"> Ease</span>
          </h1>
        </Flex>

        <Stack className="max-w-4xl max-sm:w-full">
          <Box className="text-white font-[200] text-4xl max-sm:text-center max-lg:mt-4 max-sm:text-xl">
            <span className="font-semibold">Subscribe </span>
            To Our Newsletter
          </Box>
          <Flex className="relative">
            <Input
              size="lg"
              // value={input}
              placeholder="Enter your email"
              // onChange={(e) => setInput(e.target.value)}
              className="bg-white border-none outline-none focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none shadow-none rounded-full pr-24 placeholder:text-gray-400 w-full max-sm:text-sm"
              style={{
                boxShadow: "none !important",
                outline: "none !important",
                border: "none !important",
              }}
            />
            <button className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-[#1797B9] text-white px-12 py-3 rounded-full text-sm font-medium hover:bg-[#1797B9]/80 transition-colors max-sm:px-8">
              Join
            </button>
          </Flex>
        </Stack>
      </Flex>
    </Box>
  );
};
