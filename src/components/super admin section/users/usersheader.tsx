import { PageWrapper } from "@/components/common/pagewrapper";
import { Center } from "@/components/ui/center";
import { Stack } from "@/components/ui/stack";
import { UsersTable } from "./userstable";

export const UsersHeader = () => {
  return (
    <PageWrapper className="mt-6">
      <Center className="justify-between px-4 py-6">
        <Stack className="gap-1">
          <h1 className="text-black text-3xl max-sm:text-xl font-medium">
            Users Management
          </h1>
          <h1 className={`max-sm:text-sm max-w-[700px] text-gray-500`}>
            View and manage all users registered on the platform. Delete users
            and their associated data.
          </h1>
        </Stack>
      </Center>

      <UsersTable />
    </PageWrapper>
  );
};
