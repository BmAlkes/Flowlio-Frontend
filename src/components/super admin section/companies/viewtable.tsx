import { ColumnDef } from "@tanstack/react-table";
import { Center } from "@/components/ui/center";
import { Box } from "@/components/ui/box";
import { ReusableTable } from "@/components/reusable/reusabletable";
import { PageWrapper } from "@/components/common/pagewrapper";
import { CompanyUser } from "@/hooks/useGetCompanyDetails";

export type Data = {
  id: string;
  status: string;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
};

export const columns: ColumnDef<Data>[] = [
  {
    accessorKey: "name",
    header: () => <Box className="text-black p-4">Employee Name</Box>,
    cell: ({ row }) => (
      <Box className="capitalize p-4 max-sm:w-full">
        {row.original.name.length > 28
          ? row.original.name.slice(0, 28) + "..."
          : row.original.name}
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
    accessorKey: "role",
    header: () => <Box className="text-black text-start">Role</Box>,
    cell: ({ row }) => (
      <Box className="captialize text-start">{row.original.role}</Box>
    ),
  },

  {
    accessorKey: "status",
    header: () => <Center className="text-black">Status</Center>,
    cell: ({ row }) => {
      return (
        <Center className="capitalize w-20 h-9 gap-2 border text-white bg-[#00A400] border-[#00A400] rounded-full text-center mx-auto">
          <Box className="w-1.5 h-1.5 rounded-full bg-white" />
          <h1 className="text-white text-xs text-center ">
            {row.original.status}
          </h1>
        </Center>
      );
    },
  },

  {
    accessorKey: "joinedAt",
    header: () => <Box className="text-center text-black">Joined Date</Box>,
    cell: ({ row }) => {
      const joinedDate = new Date(row.original.joinedAt);
      return (
        <Center className="space-x-2">{joinedDate.toLocaleDateString()}</Center>
      );
    },
  },
];

interface ViewTableProps {
  users: CompanyUser[];
}

export const ViewTable = ({ users }: ViewTableProps) => {
  // Transform the users data to match the table format
  const transformedData: Data[] = users.map((user) => ({
    id: user.id,
    status: user.status,
    name: user.user.name,
    email: user.user.email,
    role: user.role,
    joinedAt: user.joinedAt,
  }));

  return (
    <PageWrapper className="bg-white border-none w-full min-h-full p-0">
      <h1 className="text-black text-xl max-sm:text-lg font-medium p-4 pb-0">
        Employees ({users.length})
      </h1>

      <ReusableTable
        data={transformedData}
        columns={columns}
        // searchInput={false}
        enablePaymentLinksCalender={false}
        searchClassName="rounded-full"
        filterClassName="rounded-full"
        enableGlobalFilter={false}
        onRowClick={(row) => console.log("Row clicked:", row.original)}
        enableSuperAdminTable={false}
        enableCompanyDetailsTable={true}
      />
    </PageWrapper>
  );
};
