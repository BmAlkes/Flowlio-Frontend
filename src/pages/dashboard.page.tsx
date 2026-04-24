import { BarChartComponent } from "@/components/admin/dashboard/barchart/barchart";
import { RecentActivities } from "@/components/admin/dashboard/recentactivities";
import { OngoingTasks } from "@/components/admin/dashboard/ongoingtasks";
import { Stat, Stats } from "@/components/admin/dashboard/stats";
import { Stack } from "@/components/ui/stack";
import { Flex } from "@/components/ui/flex";
import { ProjectStatusPieChart } from "@/components/admin/dashboard/barchart/piechart";
import TimeModal from "@/components/timemodal";
import { useFetchOrganizationTotalClients } from "@/hooks/useFetchOrganizationTotalClients";
import { useFetchOrganizationActiveProjects } from "@/hooks/useFetchOrganizationActiveProjects";
import { useFetchOrganizationWeeklyHoursTracked } from "@/hooks/useFetchOrganizationWeeklyHoursTracked";
import { useFetchOrganizationPendingTasks } from "@/hooks/useFetchOrganizationPendingTasks";
import {
  useFetchProjectStatusData,
  transformToPieChartData,
} from "@/hooks/useFetchProjectStatusData";
import { formatHours } from "@/utils/timeFormat";
import img1 from "/dashboard/1.svg";
import img2 from "/dashboard/2.svg";
import img3 from "/dashboard/3.svg";
import img4 from "/dashboard/4.svg";
import Img1 from "/dashboard/prostat1.svg";
import Img2 from "/dashboard/prostat2.svg";
import Img3 from "/dashboard/projstat3.svg";
import { DemoPasswordChangeModal } from "@/components/dempasswordchangemodal";
import { TeamProductivityChart } from "@/components/admin/dashboard/barchart/teamproductivitychart";
import { useState, useEffect } from "react";
import { useUserProfile } from "@/hooks/useuserprofile";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { DashboardAIBot } from "@/components/ai assist/DashboardAIBot";
import { DashboardSkeleton, SkeletonWrapper } from "@/components/skeletons";

const DashboardPage = () => {
  const { t } = useTranslation();
  document.title = `${t("dashboard.title")} - Flowlio`;

  const { data: userProfile, refetch } = useUserProfile();
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const queryClient = useQueryClient();

  // Check if demo user needs to change password
  useEffect(() => {
    if (
      userProfile?.data?.demoOrgInfo?.isDemo &&
      !userProfile?.data?.demoOrgInfo?.passwordChanged
    ) {
      setShowPasswordChangeModal(true);
    } else {
      // If password has been changed, hide the modal
      setShowPasswordChangeModal(false);
    }
  }, [userProfile]);

  // Fetch real data for stats
  const { data: totalClientsResponse, isLoading: isLoadingClients, isFetching: isFetchingClients } = useFetchOrganizationTotalClients();
  const { data: activeProjectsResponse, isLoading: isLoadingProjects, isFetching: isFetchingProjects } = useFetchOrganizationActiveProjects();
  const { data: weeklyHoursResponse, isLoading: isLoadingHours, isFetching: isFetchingHours } =
    useFetchOrganizationWeeklyHoursTracked();
  const { data: pendingTasksResponse, isLoading: isLoadingTasks, isFetching: isFetchingTasks } = useFetchOrganizationPendingTasks();
  const { data: projectStatusResponse, isLoading: isLoadingStatus, isFetching: isFetchingStatus } = useFetchProjectStatusData();

  // Aggregated loading flag — show skeleton while any stats hook is in flight
  const isAnyLoading =
    isLoadingClients || isLoadingProjects || isLoadingHours || isLoadingTasks || isLoadingStatus ||
    isFetchingClients || isFetchingProjects || isFetchingHours || isFetchingTasks || isFetchingStatus;

  // Extract values from responses
  const totalClients = totalClientsResponse?.data?.totalClients ?? 0;
  const activeProjects = activeProjectsResponse?.data?.activeProjects ?? 0;
  const weeklyHours = weeklyHoursResponse?.data?.weeklyHours ?? 0;
  const pendingTasks = pendingTasksResponse?.data?.pendingTasks ?? 0;

  const stats: Stat[] = [
    {
      link: "/dashboard/client-management",
      title: t("dashboard.totalClients"),
      description: t("dashboard.activeUsersDesc"),
      icon: img1,
      count: String(totalClients),
    },
    {
      link: "/dashboard/project",
      title: t("dashboard.activeProjects"),
      description: t("dashboard.ongoingProjectsDesc"),
      icon: img2,
      count: String(activeProjects),
    },
    {
      link: "/dashboard/time-tracking", // Add route for time tracking
      title: t("dashboard.hoursTracked"),
      description: t("dashboard.timeLoggedDesc"),
      icon: img3,
      count: formatHours(weeklyHours),
    },
    {
      link: "/dashboard/task-management",
      title: t("dashboard.pendingTasks"),
      description: t("dashboard.tasksNotCompletedDesc"),
      icon: img4,
      count: String(pendingTasks),
    },
  ];

  // Transform project status data for pie chart
  const pieChartData = projectStatusResponse?.data
    ? transformToPieChartData(projectStatusResponse.data)
    : [
        {
          name: t("dashboard.ongoing"),
          value: 0,
          icon: Img2,
          color: "#FFE000",
        },
        {
          name: t("dashboard.delayed"),
          value: 0,
          icon: Img3,
          color: "#F50057",
        },
        {
          name: t("dashboard.finished"),
          value: 0,
          icon: Img1,
          color: "#3f53b5",
        },
      ];

  // issue fixed
  return (
    <SkeletonWrapper
      isLoading={isAnyLoading}
      skeleton={<DashboardSkeleton />}
    >
      <Stack className="pt-5 gap-3 px-2">
      <Stats stats={stats} />
      <Flex className="max-[950px]:flex-col items-start gap-3">
        <Stack className="w-full gap-3">
          <BarChartComponent />
          <OngoingTasks />
          {(userProfile?.data?.role === "superadmin" ||
            userProfile?.data?.role === "subadmin" ||
            userProfile?.data?.isOrganizationOwner ||
            userProfile?.data?.isOrganizationManager) && (
            <TeamProductivityChart />
          )}
        </Stack>

        <Stack className="max-[950px]:w-full items-start gap-3">
          <ProjectStatusPieChart
            className="w-full"
            data={pieChartData}
            title={t("dashboard.projectStatus")}
          />
          <RecentActivities className="w-full" />
        </Stack>
      </Flex>

      <TimeModal />

      <DemoPasswordChangeModal
        open={showPasswordChangeModal}
        onOpenChange={(open) => {
          // Close modal immediately when password is changed
          setShowPasswordChangeModal(false);
          if (!open) {
            // Refetch user profile after password change to update the state
            queryClient.invalidateQueries({ queryKey: ["user-profile"] });
            refetch();
          }
        }}
      />

      {/* AI Bot Floating Button */}
      <DashboardAIBot />
    </Stack>
    </SkeletonWrapper>
  );
};

export default DashboardPage;
