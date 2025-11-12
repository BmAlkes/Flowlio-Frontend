import { Center } from "../ui/center";
import { PageWrapper } from "../common/pagewrapper";
import { Stack } from "../ui/stack";
import { UserManagementTable } from "./usermanagementtable";
import { Button } from "../ui/button";
import { CirclePlus } from "lucide-react";
import { useNavigate } from "react-router";
import { useGetCurrentOrgUserMembers } from "@/hooks/usegetallusermembers";

export const UserManagementHeader = () => {
  const navigate = useNavigate();
  // const { data: userData } = useUser();
  const {
    data: userMembersData,
    isLoading,
    error,
    refetch,
  } = useGetCurrentOrgUserMembers();

  const userMembers = userMembersData?.data?.userMembers || [];

  return (
    <PageWrapper className="mt-6">
      {/* Debug Info - Remove this in production */}
      {/* {process.env.NODE_ENV === "development" && (
        <div className="mb-4 p-4 bg-gray-100 rounded-lg text-sm">
          <h3 className="font-semibold mb-2">🔍 Debug Info:</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Current User:</strong> {userData?.user?.name} (
              {userData?.user?.email})
            </div>
            <div>
              <strong>Organization ID:</strong>{" "}
              {userMembersData?.data?.organizationId || "None"}
            </div>
            <div>
              <strong>User Members Found:</strong> {userMembers.length}
            </div>
            <div>
              <strong>Status:</strong>{" "}
              {isLoading ? "Loading..." : error ? "Error" : "Success"}
            </div>
          </div>
        </div>
      )} */}

      <Center className="justify-between px-4 py-6 max-sm:flex-col max-sm:items-start gap-2">
        <Stack className="gap-1">
          <h1 className="text-black text-3xl max-sm:text-xl font-medium">
            User Management
          </h1>
          <h1 className={`max-sm:text-sm max-w-[600px] text-gray-500`}>
            Control access, roles, and permissions across your organization.
            {/* {userMembersData?.data?.organizationId && (
              <span className="block mt-1 text-blue-600 font-medium">
                Organization ID: {userMembersData.data.organizationId}
              </span> */}
            {/* )} */}
          </h1>
        </Stack>

        <Button
          variant="outline"
          className="bg-black text-white border border-gray-200  rounded-full px-6 py-5 flex items-center gap-2 cursor-pointer w-44"
          onClick={() =>
            navigate("/dashboard/user-management/add-user-members")
          }
        >
          <CirclePlus className="fill-white text-black size-5" />
          Add Members
        </Button>
      </Center>

      <UserManagementTable
        userMembers={userMembers}
        error={error}
        isLoading={isLoading}
        refetch={refetch}
      />
    </PageWrapper>
  );
};
