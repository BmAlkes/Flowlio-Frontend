import { ColumnDef } from "@tanstack/react-table";
import { Center } from "@/components/ui/center";
import { Box } from "@/components/ui/box";
import { ReusableTable } from "@/components/reusable/reusabletable";
import { Button } from "@/components/ui/button";
import { Stack } from "@/components/ui/stack";
import { PageWrapper } from "@/components/common/pagewrapper";
import { IoEye } from "react-icons/io5";
import { useMemo } from "react";
import { useNavigate } from "react-router";
import { useFetchAllOrganizations } from "@/hooks/usefetchallorganizations";

export type Data = {
  id: string;
  slug?: string;
  plan: string;
  submittedby: string;
  country: string;
  companyname: string;
  email: string;
  registrationDate: Date;
};

const getColumns = (
  navigate: ReturnType<typeof useNavigate>
): ColumnDef<Data>[] => [
  {
    accessorKey: "companyname",
    header: () => <Box className="text-black py-3 px-3">Company Name</Box>,
    cell: ({ row }) => (
      <Box className="capitalize py-3 px-3 max-sm:w-full">
        {row.original.companyname.length > 28
          ? row.original.companyname.slice(0, 28) + "..."
          : row.original.companyname}
      </Box>
    ),
  },
  {
    accessorKey: "email",
    header: () => <Box className="text-black text-start">Email</Box>,
    cell: ({ row }) => (
      <Box className="captialize text-start">{row.original.email}</Box>
    ),
  },
  {
    accessorKey: "registrationDate",
    header: () => (
      <Box className="text-black text-start">Registration Date</Box>
    ),
    cell: ({ row }) => (
      <Box className="captialize text-start">
        {row.original.registrationDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </Box>
    ),
  },
  {
    accessorKey: "country",
    header: () => <Box className="text-black text-center">Country</Box>,
    cell: ({ row }) => (
      <Box className="captialize text-center">{row.original.country}</Box>
    ),
  },

  {
    accessorKey: "plan",
    header: () => <Box className="text-center text-black">Plan</Box>,
    cell: ({ row }) => {
      return <Box className="text-center">{row.original.plan}</Box>;
    },
  },

  {
    accessorKey: "actions",
    header: () => <Box className="text-center text-black">Actions</Box>,
    cell: ({ row }) => {
      return (
        <Center className="space-x-2">
          <Button
            variant="outline"
            className="bg-[#424242] border-none hover:bg-black/80 cursor-pointer rounded-lg h-11 w-12"
            onClick={() => {
              const fallback = row.original.companyname
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
              const slug = row.original.slug || fallback;
              navigate(`/superadmin/companies/details/${slug}`);
            }}
          >
            <IoEye className="size-6 fill-white" />
          </Button>
        </Center>
      );
    },
  },
];

export const SuperAdminTable = () => {
  const {
    data: allOrganizationsResponse,
    isLoading,
    error,
  } = useFetchAllOrganizations();
  const navigate = useNavigate();

  const data: Data[] = useMemo(() => {
    const organizations = Array.isArray(allOrganizationsResponse?.data)
      ? (allOrganizationsResponse!.data as any[])
      : [];

    const sorted = [...organizations].sort((a, b) => {
      const aDate = new Date(a.createdAt).getTime();
      const bDate = new Date(b.createdAt).getTime();
      return bDate - aDate;
    });

    const recent = sorted.slice(0, 10);

    return recent.map((org) => {
      const ownerEmail = org.userOrganizations?.find(
        (uo: any) => uo.role === "owner"
      )?.user?.email;
      const fallbackEmail = org.userOrganizations?.[0]?.user?.email;
      const email: string = ownerEmail || fallbackEmail || "N/A";

      return {
        id: org.id,
        slug: org.slug,
        plan: org.subscriptionPlan?.name || "N/A",
        submittedby: "",
        country: "N/A",
        companyname: org.name || "N/A",
        email,
        registrationDate: new Date(org.createdAt),
      } as Data;
    });
  }, [allOrganizationsResponse]);

  if (isLoading) {
    return (
      <PageWrapper>
        <Center className="justify-between p-4">
          <Stack className="gap-1">
            <h1 className="text-black text-2xl max-sm:text-xl font-medium">
              Recently Registered Companies
            </h1>
          </Stack>
        </Center>
        <Box className="min-h-[180px] flex items-center justify-center text-gray-600">
          Loading...
        </Box>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <Center className="justify-between p-4">
          <Stack className="gap-1">
            <h1 className="text-black text-2xl max-sm:text-xl font-medium">
              Recently Registered Companies
            </h1>
          </Stack>
        </Center>
        <Box className="min-h-[180px] flex items-center justify-center text-red-600">
          Failed to load companies
        </Box>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Center className="justify-between p-4">
        <Stack className="gap-1">
          <h1 className="text-black text-2xl max-sm:text-xl font-medium">
            Recently Registered Companies
          </h1>
        </Stack>
      </Center>

      <ReusableTable
        data={data}
        columns={getColumns(navigate)}
        // searchInput={false}
        enablePaymentLinksCalender={false}
        searchClassName="rounded-full"
        filterClassName="rounded-full"
        enableGlobalFilter={false}
        onRowClick={(row) => console.log("Row clicked:", row.original)}
        enableSuperAdminTable={true}
      />
    </PageWrapper>
  );
};
