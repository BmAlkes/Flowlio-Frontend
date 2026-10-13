import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, expect, it, vi } from "vitest";
import Dashboard from "./dashboard.page";
const state = vi.hoisted(() => ({ owner: true, clients: vi.fn() }));
vi.mock("@/hooks/useuserprofile", () => ({ useUserProfile: () => ({ data: { data: { name: "TESTE", role: "user", isOrganizationOwner: state.owner } } }) }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock("@/hooks/useFetchOrganizationTotalClients", () => ({ useFetchOrganizationTotalClients: state.clients }));
vi.mock("@/hooks/usePlanAccess", () => ({ useHasFeatureAccess: () => ({}) }));
vi.mock("@/hooks/useFetchProjectStatusData", () => ({ useFetchProjectStatusData: () => ({}), transformToPieChartData: () => [] }));
vi.mock("@/hooks/useFetchOrganizationActiveProjects", () => ({ useFetchOrganizationActiveProjects: () => ({}) }));
vi.mock("@/hooks/useFetchOrganizationWeeklyHoursTracked", () => ({ useFetchOrganizationWeeklyHoursTracked: () => ({}) }));
vi.mock("@/hooks/useFetchOrganizationPendingTasks", () => ({ useFetchOrganizationPendingTasks: () => ({}) }));
vi.mock("@/hooks/useFetchOrganizationCompletedTasks", () => ({ useFetchOrganizationCompletedTasks: () => ({}) }));
vi.mock("@/components/admin/dashboard/barchart/barchart", () => ({ BarChartComponent: () => <div>BarChartComponent</div> }));
vi.mock("@/components/admin/dashboard/barchart/piechart", () => ({ ProjectStatusPieChart: () => <div>ProjectStatusPieChart</div> }));
vi.mock("@/components/admin/dashboard/barchart/teamproductivitychart", () => ({ TeamProductivityChart: () => <div>TeamProductivityChart</div> }));
vi.mock("@/components/admin/dashboard/recentactivities", () => ({ RecentActivities: () => <div>RecentActivities</div> }));
vi.mock("@/components/admin/dashboard/ongoingtasks", () => ({ OngoingTasks: () => <div>OngoingTasks</div> }));
vi.mock("@/components/admin/dashboard/AttentionPreview", () => ({ AttentionPreview: () => <div>AttentionPreview</div> }));
vi.mock("@/components/admin/dashboard/FollowUpWidget", () => ({ FollowUpWidget: () => <div>FollowUpWidget</div> }));
vi.mock("@/components/admin/dashboard/ProjectRiskAlertsWidget", () => ({ ProjectRiskAlertsWidget: () => <div>ProjectRiskAlertsWidget</div> }));
vi.mock("@/components/user section/AITokenUsageWidget", () => ({ AITokenUsageWidget: () => <div>AITokenUsageWidget</div> }));
vi.mock("@/components/dempasswordchangemodal", () => ({ DemoPasswordChangeModal: () => <div>DemoPasswordChangeModal</div> }));
beforeEach(() => { vi.clearAllMocks(); state.owner = true; state.clients.mockReturnValue({}); });
function setup() { return render(<QueryClientProvider client={new QueryClient()}><MemoryRouter><Dashboard /></MemoryRouter></QueryClientProvider>); }
it("keeps the original indicators and charts visible without inventing missing values", () => {
 setup();
 expect(screen.getByRole("link", { name: "dashboard.newProject" })).toHaveAttribute("href", "/dashboard/project/create-project");
 expect(screen.getAllByText("—")).toHaveLength(5);
 expect(screen.getByText("AttentionPreview")).toBeInTheDocument();
 expect(screen.getByText("BarChartComponent")).toBeInTheDocument();
 expect(screen.getByText("ProjectStatusPieChart")).toBeInTheDocument();
 expect(screen.getByText("RecentActivities")).toBeInTheDocument();
 expect(screen.queryByRole("button", {name: "dashboard.reportsAndActivity"})).not.toBeInTheDocument();
});
it("does not show management actions, organization activity or fetch client statistics for a member", () => {
 state.owner = false; setup();
 expect(state.clients).toHaveBeenCalledWith(false);
 expect(screen.queryByRole("link", { name: "dashboard.newClient" })).not.toBeInTheDocument();
 expect(screen.queryByText("AttentionPreview")).not.toBeInTheDocument();
 expect(screen.getByRole("link", { name: "dashboard.logTime" })).toHaveAttribute("href", "/dashboard/time-tracking");
 expect(screen.queryByText("RecentActivities")).not.toBeInTheDocument();
});

