import { useState } from "react";
import { Box } from "../ui/box";
import { Flex } from "../ui/flex";
import { Input } from "../ui/input";
import { Stack } from "../ui/stack";
import { useNewsletterSubscription } from "@/hooks/usenewslettersubscription";

export const SubscribeTo = () => {
  const [email, setEmail] = useState("");
  const newsletterMutation = useNewsletterSubscription();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      return;
    }

    newsletterMutation.mutate(
      { email: email.trim() },
      {
        onSuccess: () => {
          setEmail(""); // Clear input on success
        },
      }
    );
  };

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
          <form onSubmit={handleSubmit}>
            <Flex className="relative">
              <Input
                size="lg"
                type="email"
                value={email}
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
                disabled={newsletterMutation.isPending}
                className="bg-white border-none outline-none focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none shadow-none rounded-full pr-24 placeholder:text-gray-400 w-full max-sm:text-sm disabled:opacity-70"
                style={{
                  boxShadow: "none !important",
                  outline: "none !important",
                  border: "none !important",
                }}
              />
              <button
                type="submit"
                disabled={newsletterMutation.isPending || !email.trim()}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-[#1797B9] text-white px-12 py-3 rounded-full text-sm font-medium hover:bg-[#1797B9]/80 transition-colors max-sm:px-8 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {newsletterMutation.isPending ? "Joining..." : "Join"}
              </button>
            </Flex>
          </form>
        </Stack>
      </Flex>
    </Box>
  );
};
