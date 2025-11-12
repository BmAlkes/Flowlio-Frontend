import { ColumnDef } from "@tanstack/react-table";
import { Center } from "@/components/ui/center";
import { Box } from "@/components/ui/box";
import { ReusableTable } from "@/components/reusable/reusabletable";
import { Button } from "@/components/ui/button";
import { Stack } from "@/components/ui/stack";
import { format, isWithinInterval } from "date-fns";
import { Flex } from "@/components/ui/flex";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "@/components/customeIcons";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { IPlan } from "@/types";
import { useFetchAllOrganizations } from "@/hooks/usefetchallorganizations";

// const data: Data[] = [
//   {
//     id: "1",
//     amount: 3,
//     status: "active",
//     companyName: "Innovate Labs",
//     lastbilledon: new Date("2025-03-01T00:00:00"),
//     startDate: new Date("2025-02-21T00:00:00"),
//     expiredate: new Date("2025-03-01T00:00:00"),
//     subscribtionplan: "Basic",
//   },
//   {
//     id: "2",
//     amount: 30,
//     companyName: "Innovate Labs",
//     status: "inActive",
//     lastbilledon: new Date("2025-03-01T00:00:00"),
//     startDate: new Date("2025-04-09T00:00:00"),
//     expiredate: new Date("2025-06-01T00:00:00"),
//     subscribtionplan: "Standard",
//   },
//   {
//     id: "3",
//     amount: 10,
//     companyName: "Innovate Labs",
//     status: "active",
//     lastbilledon: new Date("2025-03-01T00:00:00"),
//     startDate: new Date("2025-01-14T00:00:00"),
//     expiredate: new Date("2025-02-01T00:00:00"),
//     subscribtionplan: "Premium",
//   },
//   {
//     id: "4",
//     amount: 3,
//     companyName: "Innovate Labs",
//     status: "inActive",
//     lastbilledon: new Date("2025-03-01T00:00:00"),
//     startDate: new Date("2025-02-12T00:00:00"),
//     expiredate: new Date("2025-06-01T00:00:00"),
//     subscribtionplan: "Basic",
//   },
//   {
//     id: "5",
//     amount: 3,
//     companyName: "Innovate Labs",
//     status: "active",
//     lastbilledon: new Date("2025-03-01T00:00:00"),
//     startDate: new Date("2025-03-10T00:00:00"),
//     expiredate: new Date("2025-04-01T00:00:00"),
//     subscribtionplan: "Standard",
//   },
//   {
//     id: "6",
//     amount: 12,
//     companyName: "Innovate Labs",
//     status: "inActive",
//     lastbilledon: new Date("2025-03-01T00:00:00"),
//     startDate: new Date("2025-04-04T00:00:00"),
//     expiredate: new Date("2025-05-11T00:00:00"),
//     subscribtionplan: "Premium",
//   },
//   {
//     id: "7",
//     amount: 3,
//     companyName: "Innovate Labs",
//     status: "active",
//     lastbilledon: new Date("2025-03-01T00:00:00"),
//     startDate: new Date("2025-01-01T00:00:00"),
//     expiredate: new Date("2025-06-01T00:00:00"),
//     subscribtionplan: "Basic",
//   },
//   {
//     id: "8",
//     amount: 24,
//     companyName: "Innovate Labs",
//     status: "inActive",
//     lastbilledon: new Date("2025-03-01T00:00:00"),
//     startDate: new Date("2025-01-01T00:00:00"),
//     expiredate: new Date("2025-06-01T00:00:00"),
//     subscribtionplan: "Standard",
//   },
//   {
//     id: "9",
//     amount: 13,
//     companyName: "Innovate Labs",
//     status: "inActive",
//     lastbilledon: new Date("2025-03-01T00:00:00"),
//     startDate: new Date("2025-01-01T00:00:00"),
//     expiredate: new Date("2025-06-01T00:00:00"),
//     subscribtionplan: "Premium",
//   },
// ];
export interface SubscriptionsHeaderProps {
  fetchedPlans?: IPlan[];
  isLoading?: boolean;
  error?: any;
}

export type Data = {
  id: string;
  amount: number;
  status: "active" | "inActive";
  lastbilledon: Date;
  subscribtionplan: string;
  companyName: string;
  startDate: Date;
  expiredate: Date;
};

export const columns: ColumnDef<Data>[] = [
  {
    accessorKey: "companyName",
    header: () => <Box className="text-black p-4">Company Name</Box>,
    cell: ({ row }) => (
      <Box className="capitalize p-4 w-30 max-sm:w-full">
        {row.original.companyName.length > 28
          ? row.original.companyName.slice(0, 28) + "..."
          : row.original.companyName}
      </Box>
    ),
  },
  {
    accessorKey: "subscribtionplan",
    header: () => (
      <Box className="text-black text-start">Subscribtion Plan</Box>
    ),
    cell: ({ row }) => (
      <Box className="captialize text-start">
        {row.original.subscribtionplan}
      </Box>
    ),
  },

  {
    accessorKey: "startDate",
    header: () => <Box className="text-center text-black">Start Date</Box>,
    cell: ({ row }) => {
      const startDate = row.original.startDate;
      try {
        return (
          <Box className="text-center">{format(startDate, "MMM d, yyyy")}</Box>
        );
      } catch (error) {
        console.error("Invalid date:", startDate);
        console.log(error);
        return <Box className="text-center">Invalid Date</Box>;
      }
    },
    filterFn: (row, __columnId, filterValue: { from?: Date; to?: Date }) => {
      try {
        const { from, to } = filterValue || {};
        if (!from || !to) return true;
        const startDate = row.original.startDate;
        const expiredate = row.original.expiredate;
        return (
          isWithinInterval(startDate, { start: from, end: to }) ||
          isWithinInterval(expiredate, { start: from, end: to }) ||
          (startDate <= from && expiredate >= to)
        );
      } catch (error) {
        console.error("Date comparison error:", error);
        return false;
      }
    },
  },

  {
    accessorKey: "expiredate",
    header: () => <Box className="text-center text-black">Expire Date</Box>,
    cell: ({ row }) => {
      const expiredate = row.original.expiredate;
      try {
        return (
          <Box className="text-center">{format(expiredate, "MMM d, yyyy")}</Box>
        );
      } catch (error) {
        console.error("Invalid date:", expiredate);
        console.log(error);
        return <Box className="text-center">Invalid Date</Box>;
      }
    },
  },

  {
    accessorKey: "amount",
    header: () => <Box className="text-center text-black">Amount</Box>,
    cell: ({ row }) => {
      return (
        <Center className="text-center">{"$" + row.original.amount} </Center>
      );
    },
  },
  {
    accessorKey: "lastbilledon",
    header: () => <Box className="text-center text-black">Last Billed On</Box>,
    cell: ({ row }) => {
      return (
        <Box className="text-center">
          {format(row.original.lastbilledon, "MMM d, yyyy")}
        </Box>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => <Box className="text-center text-black">Status</Box>,
    cell: ({ row }) => {
      const status = row.original.status as "active" | "inActive";

      const statusStyles: Record<typeof status, { text: string; dot: string }> =
        {
          active: {
            text: "text-white bg-[#00A400] border-none rounded-full",
            dot: "bg-white",
          },
          inActive: {
            text: "text-white bg-[#F98618] border-none rounded-full",
            dot: "bg-white",
          },
        };

      return (
        <Center>
          <Flex
            className={`rounded-md capitalize w-28 h-10 gap-2 border items-center ${statusStyles[status].text}`}
          >
            <Flex className="ml-5.5">
              <Flex
                className={`w-2 h-2 rounded-full ${statusStyles[status].dot}`}
              />
              <span>{status}</span>
            </Flex>
          </Flex>
        </Center>
      );
    },
  },
];

export const SubscribtionTabele = ({
  fetchedPlans = [],
  isLoading = false,
  error = null,
}: SubscriptionsHeaderProps) => {
  const [date, setDate] = useState<DateRange | undefined>();
  const { data: allOrganizationsResponse } = useFetchAllOrganizations();

  const plansData: Data[] =
    fetchedPlans?.map((plan: IPlan) => ({
      id: plan.id,
      amount: parseFloat(plan.price.toString()),
      status: plan.isActive ? "active" : "inActive",
      companyName: "N/A",
      lastbilledon: new Date(plan.createdAt),
      startDate: new Date(plan.createdAt),
      expiredate: new Date(plan.updatedAt),
      subscribtionplan: plan.name,
    })) || [];

  const activeOrgSubscriptions: Data[] = Array.isArray(
    allOrganizationsResponse?.data
  )
    ? (allOrganizationsResponse!.data as any[])
        .filter((org) => org.subscriptionStatus === "active")
        .map((org) => {
          const planName = org.subscriptionPlan?.name || "N/A";
          const planPrice = org.subscriptionPlan?.price;
          const amount = planPrice ? parseFloat(String(planPrice)) : 0;
          const start = org.subscriptionStartDate
            ? new Date(org.subscriptionStartDate)
            : new Date(org.createdAt);
          const expire = org.trialEndsAt
            ? new Date(org.trialEndsAt)
            : new Date(new Date(start).getTime() + 30 * 24 * 60 * 60 * 1000);
          return {
            id: org.id,
            amount,
            status: "active",
            companyName: org.name || "N/A",
            lastbilledon: start,
            startDate: start,
            expiredate: expire,
            subscribtionplan: planName,
          } as Data;
        })
    : [];

  // Prefer real active subscriptions from organizations; then plans; then mock
  const tableData =
    activeOrgSubscriptions.length > 0
      ? activeOrgSubscriptions
      : plansData.length > 0
      ? plansData
      : [];

  // Show loading state
  if (isLoading) {
    return (
      <Box>
        <Stack className="gap-1 mb-6">
          <h1 className="text-black text-2xl font-medium max-md:text-lg">
            Subscription Plans
          </h1>
          <h1 className="text-gray-500 max-md:text-sm">
            Loading subscription plans...
          </h1>
        </Stack>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box>
        <Stack className="gap-1 mb-6">
          <h1 className="text-black text-2xl font-medium max-md:text-lg">
            Subscription Plans
          </h1>
          <h1 className="text-red-500 max-md:text-sm">
            Error loading subscription plans: {error.message}
          </h1>
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      <Center className="justify-between">
        <Stack className="gap-1">
          <h1 className="text-black text-2xl max-sm:text-xl font-medium">
            Active Subscriptions
          </h1>
        </Stack>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="border border-gray-100 max-md:ml-auto"
            >
              <CalendarIcon className="fill-[#1797B9]" />
              This Month
            </Button>
          </PopoverTrigger>
          <PopoverContent side="bottom" className="w-[19rem] mr-8">
            <Calendar
              mode="range"
              selected={date}
              onSelect={(r) => r && setDate(r)}
            />
            <Flex className="mt-3 justify-center gap-2 bg-muted px-3 py-1 rounded-sm text-sm font-medium text-primary">
              <span className="text-muted-foreground">
                {date?.from ? format(date.from, "dd LLL") : "Invalid Date"}
              </span>
              <span className="text-accent-foreground">/</span>
              <span className="text-muted-foreground">
                {date?.to ? format(date.to, "dd LLL") : "Invalid Date"}
              </span>
            </Flex>
            <Flex>
              <Button className="flex-1 mt-5" variant="outline">
                Reset
              </Button>
              <Button className="flex-1 mt-5">Apply Filter</Button>
            </Flex>
          </PopoverContent>
        </Popover>
      </Center>

      <ReusableTable
        data={tableData}
        columns={columns}
        // searchInput={false}
        enablePaymentLinksCalender={false}
        searchClassName="rounded-full"
        filterClassName="rounded-full"
        enableGlobalFilter={false}
        onRowClick={(row) => console.log("Row clicked:", row.original)}
        enableSubscriptionsTable={true}
      />
    </Box>
  );
};
