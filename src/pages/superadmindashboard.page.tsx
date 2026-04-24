import { Stat, Stats } from "@/components/admin/dashboard/stats";
import { Stack } from "@/components/ui/stack";
import { Flex } from "@/components/ui/flex";
import { ProjectStatusPieChart } from "@/components/admin/dashboard/barchart/piechart";
import img1 from "/super admin/img2.svg";
import img2 from "/super admin/img3.svg";
import img3 from "/super admin/img4.svg";
import img4 from "/super admin/img1.svg";
import Img1 from "/dashboard/prostat1.svg";
import Img2 from "/dashboard/prostat2.svg";
import Img3 from "/dashboard/projstat3.svg";
import { SuperAdminBarChartComponent } from "@/components/super admin section/super admin barchart/barchart";
import { SuperAdminTable } from "@/components/super admin section/super admin barchart/superadmintable";
import { useFetchAllOrganizations } from "@/hooks/usefetchallorganizations";
import { useFetchAllData } from "@/hooks/useFetchAllData";
import { useFetchTotalInvoices } from "@/hooks/useFetchTotalInvoices";
import { getTotalCounts } from "@/utils/chartDataProcessor";
import { useFetchSuperadminOverview } from "@/hooks/useFetchSuperadminOverview";
import { useTranslation } from "react-i18next";
// import { useUser } from "@/providers/user.provider";
// import { Badge } from "@/components/ui/badge";
import { CardSkeleton, ChartSkeleton, SkeletonWrapper } from "@/components/skeletons";

// Feature overview colors
const FEATURE_COLORS = {
  projects: "#3f53b5",
  tasks: "#FFE000",
  invoices: "#F50057",
} as const;

const SuperAdminDashboardPage = () => {
  const { t } = useTranslation();
  const { data: allDataResponse, isLoading: isLoadingAll, isFetching: isFetchingAll } = useFetchAllData();
  const { data: totalInvoicesResponse, isLoading: isLoadingInvoices } = useFetchTotalInvoices();
  const { data: overviewResponse, isLoading: isLoadingOverview } = useFetchSuperadminOverview();

  const isAnyLoading = isLoadingAll || isLoadingInvoices || isLoadingOverview || isFetchingAll;

  // Use the new all-data approach for consistent counts
  const { totalCompanies, totalProjects } = allDataResponse?.data
    ? getTotalCounts(
        allDataResponse.data.organizations,
        allDataResponse.data.projects
      )
    : { totalCompanies: 0, totalProjects: 0 };

  const totalInvoices = totalInvoicesResponse?.data?.totalInvoices ?? 0;
  const liveProjects = overviewResponse?.data?.projectsCount ?? totalProjects;
  const liveTasks = overviewResponse?.data?.tasksCount ?? 0;
  const liveInvoices = overviewResponse?.data?.invoicesCount ?? totalInvoices;

  // Use raw counts for stats, percentages for chart values
  const totalAll = liveProjects + liveTasks + liveInvoices;
  // Build integer percentages that sum to 100
  const rawPercents =
    totalAll > 0
      ? [
          Math.round((liveProjects / totalAll) * 100),
          Math.round((liveTasks / totalAll) * 100),
          Math.round((liveInvoices / totalAll) * 100),
        ]
      : [0, 0, 0];
  let sumPerc = rawPercents.reduce((a, b) => a + b, 0);
  if (sumPerc !== 100 && totalAll > 0) {
    // Adjust the largest bucket by the remainder to ensure sum = 100
    const maxIdx = rawPercents.indexOf(Math.max(...rawPercents));
    rawPercents[maxIdx] = rawPercents[maxIdx] + (100 - sumPerc);
    sumPerc = rawPercents.reduce((a, b) => a + b, 0);
  }

  // For active subscriptions, we still need the detailed org data
  const { data: allOrganizationsResponse } = useFetchAllOrganizations();
  const activeSubscriptions = Array.isArray(allOrganizationsResponse?.data)
    ? allOrganizationsResponse.data.filter(
        (org: any) => org.subscriptionStatus === "active"
      ).length
    : 0;

  const stats: Stat[] = [
    {
      link: "/superadmin/companies",
      title: t("superadminDashboard.totalCompanies"),
      description: t("superadminDashboard.companiesDesc"),
      icon: img1,
      count: String(totalCompanies),
    },
    {
      link: "/superadmin", // No specific projects route, stays on dashboard
      title: t("superadminDashboard.totalProjects"),
      description: t("superadminDashboard.projectsDesc"),
      icon: img2,
      count: String(liveProjects),
    },
    {
      link: "/superadmin/subscriptions",
      title: t("superadminDashboard.activeSubscriptions"),
      description: t("superadminDashboard.subscriptionsDesc"),
      icon: img3,
      count: String(activeSubscriptions),
    },
    {
      link: "/superadmin", // No specific invoices route, stays on dashboard
      title: t("superadminDashboard.totalInvoices"),
      description: t("superadminDashboard.invoicesDesc"),
      icon: img4,
      count: String(totalInvoices),
    },
  ];

  const featureOverviewData = [
    {
      name: "Projects",
      value: rawPercents[0],
      icon: Img1,
      color: FEATURE_COLORS.projects,
    },
    {
      name: "Tasks",
      value: rawPercents[1],
      icon: Img2,
      color: FEATURE_COLORS.tasks,
    },
    {
      name: "Invoices",
      value: rawPercents[2],
      icon: Img3,
      color: FEATURE_COLORS.invoices,
    },
  ];

  return (
    <SkeletonWrapper
      isLoading={isAnyLoading}
      skeleton={
        <Stack className="pt-5 gap-3 px-2">
          <CardSkeleton count={4} />
          <Flex className="max-[950px]:flex-col items-start gap-3">
            <ChartSkeleton height={280} className="flex-1" />
            <ChartSkeleton height={280} className="w-64 flex-shrink-0" withLegend />
          </Flex>
        </Stack>
      }
    >
      <Stack className="pt-5 gap-3 px-2">
        <Stats
          stats={stats}
          classNameDescription="text-[13px] leading-4"
          isSuperAdmin={true}
        />
        <Flex className="max-[950px]:flex-col items-start gap-3">
          <Stack className="w-full">
            <SuperAdminBarChartComponent />
          </Stack>

          <Stack className="max-[950px]:w-full items-start">
            <ProjectStatusPieChart
              data={featureOverviewData}
              title={t("superadminDashboard.featureOverview")}
            />
          </Stack>
        </Flex>

        <SuperAdminTable />
      </Stack>
    </SkeletonWrapper>
  );
};

export default SuperAdminDashboardPage;
