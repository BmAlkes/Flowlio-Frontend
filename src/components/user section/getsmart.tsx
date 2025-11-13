import { cn } from "@/lib/utils";
import { Box } from "../ui/box";
import { Center } from "../ui/center";
import { Flex } from "../ui/flex";
import { Stack } from "../ui/stack";

type GetSmartProps = {
  isInsights?: boolean;
};

export const GetSmart = ({ isInsights = false }: GetSmartProps) => {
  const smartDetails = [
    {
      title: "Productivity",
      description: "5 Ways Dotizion Can Simplify Your Daily Workflow",
      img: "/home/smart1.png",
    },
    {
      title: "Team Collaboration",
      description: "How Smart Workspaces Boost Communication & Output",
      img: "/home/smart2.png",
    },
    {
      title: "Automation",
      description: "Using Dotizion AI to Automate Time-Consuming Tasks",
      img: "/home/smart3.png",
    },
  ];

  return (
    <Center
      className={cn("relative p-8 sm:p-8", isInsights === true && "mb-12")}
    >
      {isInsights === false && (
        <img
          src="/home/graydot.svg"
          alt=""
          className="z-40 size-18 absolute -top-6 left-42 max-md:left-0"
        />
      )}

      {isInsights === false && (
        <Box
          className="bg-[url(/home/manageblock1.png)] bg-cover bg-center bg-no-repeat absolute inset-0 top-20 z-0"
          aria-hidden="true"
        />
      )}

      <Stack className="relative z-10 max-w-5xl max-lg:w-full my-14">
        <Flex className="items-start justify-start text-start flex-col gap-6 ml-6">
          <h1
            className={cn(
              " font-[100] max-lg:w-full max-sm:text-center",
              isInsights === true
                ? "sm:text-5xl text-xl w-sm"
                : "sm:text-5xl text-3xl w-sm"
            )}
          >
            Get Smarter, With{" "}
            <span className="text-[#F98618] font-semibold">
              Dotizion Insights
            </span>
          </h1>

          <p
            className={cn(
              "text-base text-black font-light leading-6 max-w-[40rem] max-md:w-full",
              isInsights === true ? "w-xl text-[15px]" : "sm:text-lg"
            )}
          >
            Explore tips, trends, and expert advice on boosting team
            productivity, automating workflows, and building smarter
            organizations.
          </p>
        </Flex>

        <Flex className="max-w-5xl mx-auto max-md:w-full max-lg:flex-col gap-6 sm:gap-8 lg:gap-10 justify-center items-center px-4 sm:px-6 mt-6">
          {smartDetails.map((item, index) => (
            <Flex
              key={index}
              className={cn(
                "w-full max-w-md flex-col items-start justify-center gap-4 text-center sm:text-left",
                isInsights && "sm:w-80"
              )}
            >
              <img
                src={item.img}
                alt={item.title}
                className="w-full h-48 object-cover p-1 border border-gray-300"
                loading="lazy"
              />
              <h2 className="text-xl text-[#1797B9] font-medium">
                {item.title}
              </h2>
              <p className="text-sm sm:text-base leading-5 font-light">
                {item.description}
              </p>
            </Flex>
          ))}
        </Flex>
      </Stack>
    </Center>
  );
};
