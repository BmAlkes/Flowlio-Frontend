import { PageWrapper } from "@/components/common/pagewrapper";
import { Center } from "@/components/ui/center";
import { Stack } from "@/components/ui/stack";
import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";
import { useNavigate } from "react-router";
import { SubAdminTable } from "./subadmintable";

export const SubAdminHeader = () => {
  const navigate = useNavigate();
  return (
    <PageWrapper className="mt-6">
      <Center className="justify-between px-4 py-6 max-sm:flex-col max-sm:items-start gap-2">
        <Stack className="gap-1">
          <h1 className="text-black text-2xl max-sm:text-xl font-medium">
            Sub Admin
          </h1>
          <h1 className={`max-sm:text-sm max-w-[600px] text-gray-500`}>
            View, add, edit, and manage access for all Sub Administrative users
            on the platform.
          </h1>
        </Stack>

        <Button
          variant="outline"
          className="bg-black text-white border border-gray-200  rounded-full px-6 py-5 flex items-center gap-2 cursor-pointer w-42 h-12"
          onClick={() => navigate("/superadmin/sub-admin/create-sub-admin")}
        >
          <CirclePlus className="fill-white text-black size-5" />
          Add Sub Admin
        </Button>
      </Center>

      <SubAdminTable />
    </PageWrapper>
  );
};
