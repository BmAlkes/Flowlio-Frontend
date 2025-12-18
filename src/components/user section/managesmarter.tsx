import { useNavigate } from "react-router";
import { Box } from "../ui/box";
import { Button } from "../ui/button";
import { Center } from "../ui/center";
import { Flex } from "../ui/flex";
import { CiCircleCheck } from "react-icons/ci";
import { useFetchPublicPlans } from "@/hooks/usefetchplans";
import { Loader2 } from "lucide-react";

export const ManageSmarter = () => {
  const navigate = useNavigate();

  const { data: plansResponse, isLoading, isError } = useFetchPublicPlans();
  const trialDays = plansResponse?.data?.map((plan) => plan.trialDays);

  return (
    <Box className="w-full h-full bg-[#392AE2] p-8 max-sm:px-0">
      <Box className="relative z-30 mt-10 px-4">
        <Flex className="justify-center w-full mx-auto gap-4 items-center max-md:flex-col relative z-30">
          <Center className="items-start max-sm:items-center gap-6 w-xl max-sm:w-full p-2 flex-col text-5xl font-[100] max-sm:text-2xl text-white  ">
            <h1 className="text-white max-sm:text-center">
              Start Managing Smarter
              <span className="text-[#F98618] font-semibold p-0">
                {" "}
                For Free
              </span>
            </h1>
            <p className="text-white font-extralight text-[16px] w-md max-sm:w-full leading-5">
              Dotiziion helps you streamline your workflows, automate tasks, and
              boost team productivity — all from one powerful dashboard.
            </p>

            <Flex className="text-white font-extralight text-[17px] gap-8">
              {isLoading ? (
                <Loader2 className="text-[#F98618] size-6 animate-spin" />
              ) : isError ? (
                <span>Error: {isError}</span>
              ) : (
                <h1 className="flex items-center gap-2">
                  <CiCircleCheck className="text-[#F98618] size-6" />

                  <span>{trialDays?.[0]}-Day Free Trial</span>
                </h1>
              )}

              <h1 className="flex items-center gap-2">
                <CiCircleCheck className="text-[#F98618] size-6" />
                No credit card required
              </h1>
            </Flex>
            <Button
              onClick={() => navigate("/pricing")}
              className="p-2 h-11 w-34 rounded-3xl bg-[#1797B9] cursor-pointer hover:bg-[#1797B9]/80"
            >
              Try Free Trail
            </Button>
          </Center>
          <img
            src="/home/smart.png"
            alt="cards"
            className="size-100 z-40 max-lg:size-70"
          />
        </Flex>
      </Box>
    </Box>
  );
};
