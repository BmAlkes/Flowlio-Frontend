import { Button } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Stack } from "@/components/ui/stack";
import { Flex } from "@/components/ui/flex";
import { useNavigate } from "react-router";
import { useEffect } from "react";

export const NotFound = () => {
  const navigate = useNavigate();
  useEffect(() => {
    scrollTo(0, 0);
    document.title = "Not Found - Flowlio";
  }, []);

  return (
    <Flex className="gap-0 h-screen items-stretch">
      <Center className="flex-1">
        <Stack className="items-center p-3 text-center">
          <img src="/general/404.svg" className="h-64 max-md:block hidden" />
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
            Page Not Found
          </h1>

          <p className="text-gray-500 mb-2 mt-1">
            Looks like you've ventured into the unknown digital realm.
          </p>

          <Button
            className="transition-transform hover:scale-110"
            onClick={() => navigate(-1)}
          >
            Return to website
          </Button>
        </Stack>
      </Center>
      <Center className="flex-1 bg-slate-100 max-md:hidden">
        <img src="/general/404.svg" className="h-80" />
      </Center>
    </Flex>
  );
};
