import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { cn } from "@/lib/utils";

export const WorkflowdDetails = () => {
  return (
    <Center className="max-w-6xl max-lg:w-full flex-col mx-auto h-full overflow-hidden bg-white px-2 py-12">
      <Center className={`gap-8 py-12 px-4 max-sm:flex-col max-sm:items-start`}>
        <Box className="flex-1 max-w-md ">
          <Box className={cn(`text-5xl text-gray-800 mb-4`)}>
            <span className="text-gray-800 font-[100]">Simple Setup,</span>
            <span className=" text-[#F98618] font-semibold">
              {" "}
              Fast Results{" "}
            </span>
          </Box>
          <Box className="text-[15px] text-gray-600 leading-4">
            Getting started is easy. Create your workspace, invite your team,
            and pick the modules that fit your business needs. No complex setup.
            No code required
          </Box>
        </Box>
        <Box className="flex-1 flex justify-center max-sm:mt-4">
          <img
            src={"/workflow/img1.svg"}
            alt={"Simple Setup, Fast Results"}
            className="max-w-lg w-full h-auto"
          />
        </Box>
      </Center>

      <Center
        className={`gap-8 py-12 px-4 max-sm:flex-col-reverse max-sm:items-stretch`}
      >
        <Box className="flex-1 flex justify-center max-sm:mt-4">
          <img
            src={"/workflow/img2.svg"}
            alt={"Simple Setup, Fast Results"}
            className="max-w-lg w-full h-auto"
          />
        </Box>
        <Box className="flex-1 max-w-md">
          <Box className={cn(`text-5xl text-gray-800 mb-4`)}>
            <span className="text-gray-800 font-[100]">Customize Your</span>
            <span className=" text-[#F98618] font-semibold"> Workflow </span>
          </Box>
          <Box className="text-[15px] text-gray-600 leading-4.5 max-w-[21rem]">
            From HR to CRM to Project Tracking—build workflows tailored for
            every department. Drag-and-drop flexibility lets you control how
            work flows through your system.
          </Box>
        </Box>
      </Center>

      <Center
        className={`gap-8 py-12 px-4 max-sm:flex-col max-sm:items-stretch`}
      >
        <Box className="flex-1 max-w-md">
          <Box className={cn(`text-5xl text-gray-800 mb-4`)}>
            <span className="text-gray-800 font-[100]">Automation That</span>
            <span className=" text-[#F98618] font-semibold"> Work </span>
            <span className="text-gray-800 font-[100]">For You</span>
          </Box>
          <Box className="text-[15px] text-gray-600 leading-4.5 max-w-[22rem]">
            Automate repetitive tasks, approvals, and notifications. Save time
            and reduce errors by letting Flowlio handle the manual work behind
            the scenes.
          </Box>
        </Box>
        <Box className="flex-1 flex justify-center max-sm:mt-4">
          <img
            src={"/workflow/img3.svg"}
            alt={"Simple Setup, Fast Results"}
            className="max-w-lg w-full h-auto"
          />
        </Box>
      </Center>

      <Center
        className={`gap-8 py-12 px-4 max-sm:flex-col-reverse max-sm:items-stretch`}
      >
        <Box className="flex-1 flex justify-center max-sm:mt-4">
          <img
            src={"/workflow/img4.svg"}
            alt={"Simple Setup, Fast Results"}
            className="max-w-lg w-full h-auto"
          />
        </Box>
        <Box className="flex-1 max-w-md">
          <Box
            className={cn(
              `text-5xl text-gray-800 mb-4 w-[26rem] max-lg:w-full`
            )}
          >
            <span className="text-gray-800 font-[100]">
              Stay On Track with{" "}
            </span>
            <span className=" text-[#F98618] font-semibold"> Real-Time</span>
            <span className="text-[#F98618] font-semibold"> Monitoring</span>
          </Box>
          <Box className="text-[15px] text-gray-600 leading-4.5 max-w-[22rem]">
            From HR to CRM to Project Tracking—build workflows tailored for
            every department. Drag-and-drop flexibility lets you control how
            work flows through your system.
          </Box>
        </Box>
      </Center>
    </Center>
  );
};
