import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, expect, it, vi } from "vitest";
import Dashboard from "./dashboard.page";
const state = vi.hoisted(() => ({ owner: true, clients: vi.fn(), followUps: vi.fn(), ai: false, tasks: undefined as unknown, risks: [] as unknown[] }));
vi.mock("@/hooks/useuserprofile", () => ({ useUserProfile: () => ({ data: { data: { name: "TESTE", role: "user", isOrganizationOwner: state.owner } } }) }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string, values?: Record<string, unknown>) => values?.title ? `${key}:${values.title}` : key, i18n: { language: "en" } }) }));
vi.mock("@/hooks/useFetchOrganizationTotalClients", () => ({ useFetchOrganizationTotalClients: state.clients }));
vi.mock("@/hooks/usePlanAccess", () => ({ useHasFeatureAccess: () => ({ data: { data: { hasAccess: state.ai } } }) }));
vi.mock("@/hooks/useFetchProjectStatusData", () => ({ useFetchProjectStatusData: () => ({}), transformToPieChartData: () => [] }));
vi.mock("@/hooks/useFetchOrganizationActiveProjects", () => ({ useFetchOrganizationActiveProjects: () => ({}) }));
vi.mock("@/hooks/useFetchOrganizationWeeklyHoursTracked", () => ({ useFetchOrganizationWeeklyHoursTracked: () => ({}) }));
vi.mock("@/hooks/useFetchOrganizationPendingTasks", () => ({ useFetchOrganizationPendingTasks: () => ({}) }));
vi.mock("@/hooks/useFetchOrganizationCompletedTasks", () => ({ useFetchOrganizationCompletedTasks: () => ({}) }));
vi.mock("@/hooks/useFetchOngoingTasks", () => ({ useFetchOngoingTasks: () => ({ data: state.tasks }) }));
vi.mock("@/hooks/useCRM", () => ({ useFollowUpsDashboard: state.followUps }));
vi.mock("@/hooks/usefetchcalendarevents", () => ({ useFetchCalendarEvents: () => ({ data: { data: [{ id: "e1", title: "Client kickoff", date: new Date().toISOString(), startHour: 9.5, endHour: 10 }] } }) }));
vi.mock("@/hooks/useProjectRiskAlerts", () => ({ useProjectRiskAlerts: () => ({ data: { data: state.risks } }) }));
vi.mock("@/components/admin/dashboard/barchart/barchart", () => ({ BarChartComponent: () => <div>BarChartComponent</div> }));
vi.mock("@/components/admin/dashboard/barchart/piechart", () => ({ ProjectStatusPieChart: () => <div>ProjectStatusPieChart</div> }));
vi.mock("@/components/admin/dashboard/barchart/teamproductivitychart", () => ({ TeamProductivityChart: () => <div>TeamProductivityChart</div> }));
vi.mock("@/components/admin/dashboard/recentactivities", () => ({ RecentActivities: () => <div>RecentActivities</div> }));
vi.mock("@/components/admin/dashboard/ongoingtasks", () => ({ OngoingTasks: () => <div>OngoingTasks</div> }));
vi.mock("@/components/admin/dashboard/WatchPanel", () => ({ WatchPanel: () => <div>WatchPanel</div> }));
vi.mock("@/components/admin/dashboard/FollowUpWidget", () => ({ FollowUpWidget: () => <div>FollowUpWidget</div> }));
vi.mock("@/components/admin/dashboard/ProjectRiskAlertsWidget", () => ({ ProjectRiskAlertsWidget: () => <div>ProjectRiskAlertsWidget</div> }));
vi.mock("@/components/user section/AITokenUsageWidget", () => ({ AITokenUsageWidget: () => <div>AITokenUsageWidget</div> }));
vi.mock("@/components/dempasswordchangemodal", () => ({ DemoPasswordChangeModal: () => <div>DemoPasswordChangeModal</div> }));
beforeEach(() => { vi.clearAllMocks(); state.owner = true; state.ai = false; state.tasks = undefined; state.risks = []; state.clients.mockReturnValue({}); state.followUps.mockReturnValue({}); });
function setup() { return render(<QueryClientProvider client={new QueryClient()}><MemoryRouter><Dashboard /></MemoryRouter></QueryClientProvider>); }
const day = (offset: number) => { const d = new Date(); d.setDate(d.getDate() + offset); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const task = (id: string, endDate: string | null) => ({ id, title: `Task ${id}`, endDate, projectName: "P", creatorId: "u", creatorName: "U", assignedToId: null });

it("keeps the original indicators and charts visible without inventing missing values", () => {
 setup();
 expect(screen.getByRole("link", { name: "dashboard.newProject" })).toHaveAttribute("href", "/dashboard/project/create-project");
 expect(screen.getAllByText("—")).toHaveLength(5);
 for (const block of ["WatchPanel", "BarChartComponent", "ProjectStatusPieChart", "RecentActivities", "FollowUpWidget", "OngoingTasks"]) expect(screen.getByText(block)).toBeInTheDocument();
 expect(screen.getByRole("heading", { name: "dashboard.home.thisWeek" })).toBeInTheDocument();
 expect(screen.getByRole("link", { name: /Client kickoff/ })).toHaveAttribute("href", "/dashboard/calendar");
 expect(screen.queryByText("ProjectRiskAlertsWidget")).not.toBeInTheDocument();
 expect(screen.queryByText("AITokenUsageWidget")).not.toBeInTheDocument();
});
it("does not show management blocks, follow-ups or client statistics to a member", () => {
 state.owner = false; setup();
 expect(state.clients).toHaveBeenCalledWith(false);
 expect(state.followUps).toHaveBeenCalledWith(false);
 expect(screen.queryByText("WatchPanel")).not.toBeInTheDocument();
 expect(screen.getByRole("link", { name: "dashboard.logTime" })).toHaveAttribute("href", "/dashboard/time-tracking");
 expect(screen.queryByText("RecentActivities")).not.toBeInTheDocument();
 expect(screen.queryByText("FollowUpWidget")).not.toBeInTheDocument();
 expect(screen.getAllByText("—")).toHaveLength(4);
});
it("Lio sums up overdue and due-today work from the task list, and only offers questions with the AI plan", () => {
 state.tasks = { data: [task("a", day(-3)), task("b", day(-10)), task("c", day(0)), task("d", null)] };
 setup();
 expect(screen.getByText("dashboard.home.brief.overdue")).toBeInTheDocument();
 expect(screen.getByText(/dashboard.home.brief.dueTodayOne:Task c/)).toBeInTheDocument();
 expect(screen.getByText("dashboard.home.overdueCount · dashboard.home.dueTodayCount")).toBeInTheDocument();
 expect(screen.queryByRole("textbox", { name: "dashboard.home.brief.askLabel" })).not.toBeInTheDocument();
});
it("shows the token card and the question box with the AI plan, and the risk list when a project is at risk", () => {
 state.ai = true; state.risks = [{ id: "r" }]; setup();
 expect(screen.getByText("AITokenUsageWidget")).toBeInTheDocument();
 expect(screen.getByText("ProjectRiskAlertsWidget")).toBeInTheDocument();
 expect(screen.getByRole("textbox", { name: "dashboard.home.brief.askLabel" })).toBeInTheDocument();
});
