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
import { SubscriptionHistoryModal } from "./SubscriptionHistoryModal";
import { SubscriptionAuditModal } from "./SubscriptionAuditModal";
import { AlertTriangle } from "lucide-react";

export interface SubscriptionsHeaderProps {
  fetchedPlans?: IPlan[];
  isLoading?: boolean;
  error?: any;
}

export type Data = {
  id: string;
  amount: number;
  status: "active" | "inActive" | "non  active";
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
      const status = row.original.status as
        | "active"
        | "inActive"
        | "non active";

      const statusStyles: Record<string, { text: string; dot: string }> = {
        active: {
          text: "text-white bg-[#00A400] border-none rounded-full",
          dot: "bg-white",
        },
        inActive: {
          text: "text-white bg-[#F98618] border-none rounded-full",
          dot: "bg-white",
        },
        "non active": {
          text: "text-white bg-[#F98618] border-none rounded-full",
          dot: "bg-white",
        },
      };

      const currentStatus = statusStyles[status] || statusStyles["non active"];

      return (
        <Center>
          <Flex
            className={`rounded-md capitalize w-28 h-10 gap-2 border items-center justify-center ${currentStatus.text}`}
          >
            <Flex className={`w-2 h-2 rounded-full ${currentStatus.dot}`} />
            <Box>{status}</Box>
          </Flex>
        </Center>
      );
    },
  },
  {
    id: "actions",
    header: () => <Box className="text-center text-black">Actions</Box>,
    cell: ({ row, table }) => {
      const organizationId = row.original.id;
      const handleViewHistory = () => {
        // Access the table meta to get the onViewHistory callback
        const meta = table.options.meta as any;
        if (meta?.onViewHistory) {
          meta.onViewHistory(organizationId, row.original.companyName);
        }
      };

      return (
        <Center>
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewHistory}
            className="cursor-pointer"
          >
            View History
          </Button>
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
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<
    string | null
  >(null);
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>("");
  const { data: allOrganizationsResponse } = useFetchAllOrganizations();

  const handleViewHistory = (organizationId: string, companyName: string) => {
    setSelectedOrganizationId(organizationId);
    setSelectedCompanyName(companyName);
    setHistoryModalOpen(true);
  };

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

  // Get all subscriptions (both active and non-active) from organizations
  const allOrgSubscriptions: Data[] = Array.isArray(
    allOrganizationsResponse?.data
  )
    ? (allOrganizationsResponse!.data as any[]).map((org) => {
        // Check if user has pending payment
        const userOrganizations = org.userOrganizations as
          | Array<{
              role?: string;
              user?: {
                status?: string;
                selectedPlanId?: string;
                pendingOrganizationData?: any;
              };
            }>
          | undefined;

        const ownerUser = userOrganizations?.find(
          (uo) => uo.role === "owner"
        )?.user;
        const userStatus = ownerUser?.status;

        // Get organization subscriptionStatus (case-insensitive)
        const orgSubscriptionStatus = org.subscriptionStatus?.toLowerCase();

        // Get active subscription from subscriptions array (if available)
        const activeSubscription = org.subscriptions?.find(
          (sub: any) => sub.status === "active"
        );

        // Determine status based on multiple factors (priority order):
        // 1. Check if subscription record exists and is active (most reliable)
        // 2. Check if organization subscriptionStatus is "active"
        // 3. Check if user has pending payment
        // 4. Use organization subscriptionStatus as fallback

        // Check subscription record status (most reliable indicator)
        const subscriptionRecordActive =
          activeSubscription?.status === "active";

        // Check organization subscriptionStatus
        const orgStatusActive = orgSubscriptionStatus === "active";

        // If either subscription record or org status is active, show active
        const isActive = subscriptionRecordActive || orgStatusActive;

        // Check if user has pending payment (only if not active)
        const hasPendingPayment =
          !isActive &&
          (userStatus === "pending" ||
            !userStatus ||
            userStatus === null ||
            userStatus === undefined);

        // Determine final subscription status
        const subscriptionStatus = isActive
          ? "active"
          : hasPendingPayment
          ? "non active"
          : orgSubscriptionStatus || "inActive";

        const planName = org.subscriptionPlan?.name || "N/A";
        const planPrice = org.subscriptionPlan?.price;
        const amount = planPrice ? parseFloat(String(planPrice)) : 0;
        const start = org.subscriptionStartDate
          ? new Date(org.subscriptionStartDate)
          : new Date(org.createdAt);
        // Use subscriptionEndDate (updated on renewal) instead of trialEndsAt
        // This ensures renewals are reflected in the table
        const expire = org.subscriptionEndDate
          ? new Date(org.subscriptionEndDate)
          : org.trialEndsAt
          ? new Date(org.trialEndsAt)
          : new Date(new Date(start).getTime() + 30 * 24 * 60 * 60 * 1000);
        return {
          id: org.id,
          amount,
          status: subscriptionStatus as "active" | "inActive" | "non active",
          companyName: org.name || "N/A",
          lastbilledon: start,
          startDate: start,
          expiredate: expire,
          subscribtionplan: planName,
        } as Data;
      })
    : [];

  // Prefer real subscriptions from organizations; then plans; then mock
  const tableData =
    allOrgSubscriptions.length > 0
      ? allOrgSubscriptions
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
          <Flex className="items-center gap-3">
            <h1 className="text-black text-2xl max-sm:text-xl font-medium">
              All Subscriptions
            </h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAuditModalOpen(true)}
              className="border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700 cursor-pointer"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Audit Payment
            </Button>
          </Flex>
          <h1 className="text-gray-500 text-sm max-sm:text-xs">
            Showing active and non-active subscriptions
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
        meta={{
          onViewHistory: handleViewHistory,
        }}
      />

      {/* Subscription History Modal */}
      {historyModalOpen && selectedOrganizationId && (
        <SubscriptionHistoryModal
          open={historyModalOpen}
          onOpenChange={setHistoryModalOpen}
          organizationId={selectedOrganizationId}
          companyName={selectedCompanyName}
        />
      )}

      {/* Subscription Audit Modal */}
      <SubscriptionAuditModal
        open={auditModalOpen}
        onOpenChange={setAuditModalOpen}
      />
    </Box>
  );
};
