import { PageWrapper } from "@/components/common/pagewrapper";
import { Center } from "@/components/ui/center";
import { Stack } from "@/components/ui/stack";
import { MyProjectsTable } from "./myprojectstable";

export const MyProjectsHeader = () => {
  return (
    <PageWrapper className="mt-6">
      <Center className="justify-between px-4 py-6 max-sm:flex-col max-sm:items-start gap-2">
        <Stack className="gap-1">
          <h1 className="text-black text-3xl max-sm:text-xl font-medium">
            My Projects
          </h1>
          <h1 className={`max-sm:text-sm max-w-[600px] text-gray-500`}>
            Track and manage projects efficiently
          </h1>
        </Stack>
      </Center>

      <MyProjectsTable />
    </PageWrapper>
  );
};
