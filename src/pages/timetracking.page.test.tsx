import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, expect, it, vi } from "vitest";
import TimeTrackingPage from "./timetracking.page";

const state = vi.hoisted(() => ({ scope: "org-a", start: vi.fn(), projects: vi.fn(), tasks: vi.fn(), viewerProjects: vi.fn(), viewerTasks: vi.fn() }));
vi.mock("@/hooks/useDataScope", () => ({ useDataScope: () => state.scope }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }) }));
vi.mock("@/hooks/usefetchprojects", () => ({ useFetchProjects: state.projects }));
vi.mock("@/hooks/usefetchtasks", () => ({ useFetchTasks: state.tasks }));
vi.mock("@/hooks/useFetchViewerProjects", () => ({ useFetchViewerProjects: state.viewerProjects }));
vi.mock("@/hooks/useFetchViewerTasks", () => ({ useFetchViewerTasks: state.viewerTasks }));
vi.mock("@/hooks/useTimeTracking", () => ({ useActiveTimeEntries: () => ({ data: { data: [] } }), useStartTask: () => ({ mutateAsync: state.start }), useEndTask: () => ({}), useDeleteTimeEntry: () => ({}) }));
vi.mock("@/hooks/useAllTimeEntries", () => ({ useAllTimeEntries: () => ({ data: { data: [] } }) }));
vi.mock("@/hooks/useFetchOrganizationWeeklyHoursTracked", () => ({ useFetchOrganizationWeeklyHoursTracked: () => ({ data: { data: { weeklyHours: 0 } } }) }));
vi.mock("@/components/reusable/reusabletable", () => ({ ReusableTable: () => null }));
beforeEach(() => {
  vi.clearAllMocks(); state.scope = "org-a";
  state.projects.mockReturnValue({ data: { data: [{ id: "p1", name: "Project A" }] }, isFetching: true });
  state.tasks.mockReturnValue({ data: { data: [] } });
  state.viewerProjects.mockReturnValue({ data: { data: [] } });
  state.viewerTasks.mockReturnValue({ data: { data: [] } });
});
it("prefills the project from navigation without starting a timer or fetching viewer data", () => {
  render(<MemoryRouter initialEntries={["/dashboard/time-tracking?projectId=p1"]}><TimeTrackingPage /></MemoryRouter>);
  expect(screen.getAllByRole("combobox")[0]).toHaveTextContent("Project A");
  expect(state.viewerProjects).toHaveBeenCalledWith({ enabled: false });
  expect(state.viewerTasks).toHaveBeenCalledWith({ enabled: false });
  expect(state.start).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: "timeTracking.startTracking" })).toBeDisabled();
});
it("clears project context when switching to an organization without that project", async () => {
  const view = <MemoryRouter initialEntries={["/dashboard/time-tracking?projectId=p1"]}><TimeTrackingPage /></MemoryRouter>;
  const { rerender } = render(view);
  state.scope = "org-b";
  state.projects.mockReturnValue({ data: { data: [] } });
  rerender(<MemoryRouter initialEntries={["/dashboard/time-tracking?projectId=p1"]}><TimeTrackingPage /></MemoryRouter>);
  await waitFor(() => expect(screen.getAllByRole("combobox")[0]).toHaveTextContent("timeTracking.selectProjectPlaceholder"));
  expect(state.start).not.toHaveBeenCalled();
});
it("fetches only viewer collections on the viewer route", () => {
  render(<MemoryRouter initialEntries={["/viewer/time-tracking"]}><TimeTrackingPage /></MemoryRouter>);
  expect(state.projects).toHaveBeenCalledWith({}, { enabled: false });
  expect(state.tasks).toHaveBeenCalledWith(undefined, { enabled: false });
  expect(state.viewerProjects).toHaveBeenCalledWith({ enabled: true });
  expect(state.viewerTasks).toHaveBeenCalledWith({ enabled: true });
});
