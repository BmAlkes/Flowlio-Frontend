import { PageWrapper } from "@/components/common/pagewrapper";
import { Center } from "@/components/ui/center";
import { Flex } from "@/components/ui/flex";
import { Stack } from "@/components/ui/stack";
import { Outlet } from "react-router";

export const AuthenticationLayout = () => {
  return (
    <PageWrapper className="p-0 border-none flex items-center justify-center">
      <Flex className="size-full px-10 justify-between max-md:px-0">
        <Center className="relative w-1/2 p-2 h-full max-lg:hidden">
          <img
            className="w-full h-full object-cover"
            src="/authform/astro.png"
            alt="astro"
          />

          <Stack className="absolute text-white bottom-16 left-18 max-sm:bottom-8 max-sm:left-2">
            <h1 className="text-[#F6E6A6] text-[1.40rem] font-bold max-sm:text-xl max-md:text-lg">
              Welcome Back to Productivity
            </h1>
            <h1 className="text-white font-light w-xs text-sm max-sm:text-base max-md:text-sm">
              Manage clients, track time, and move projects forward — faster and
              smarter.
            </h1>
          </Stack>
        </Center>

        <Center className="w-1/2 h-full pr-20 max-lg:w-full max-lg:pr-0">
          <Outlet />
        </Center>
      </Flex>
    </PageWrapper>
  );
};
