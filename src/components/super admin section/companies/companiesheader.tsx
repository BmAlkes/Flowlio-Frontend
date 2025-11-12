import { PageWrapper } from "@/components/common/pagewrapper";
import { Center } from "@/components/ui/center";
import { Stack } from "@/components/ui/stack";
import { CompaniesTable } from "./companiestable";

export const CompaniesHeader = () => {
  return (
    <PageWrapper className="mt-6">
      <Center className="justify-between px-4 py-6">
        <Stack className="gap-1">
          <h1 className="text-black text-3xl max-sm:text-xl font-medium">
            Companies
          </h1>
          <h1 className={`max-sm:text-sm max-w-[700px] text-gray-500`}>
            Manage all registered organizations, their subscriptions, and
            activities on the platform.
          </h1>
        </Stack>
      </Center>

      <CompaniesTable />
    </PageWrapper>
  );
};
