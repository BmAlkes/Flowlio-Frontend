import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { expect, it, vi } from "vitest";
import { groupActivities } from "./recentactivities";
import { WeekCalendar } from "./WeekCalendar";
import { OngoingTaskCard } from "./ongoingtaskcard";
import { taskUrgency } from "./home-insights";
import type { OngoingTask } from "@/hooks/useFetchOngoingTasks";
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string, values?: { count?: number }) => values?.count != null ? `${key}:${values.count}` : key, i18n: { language: "en" } }) }));
vi.mock("@/hooks/useFetchOrganizationActivities", () => ({ useFetchOrganizationActivities: () => ({}) }));

const task = (id: string, endDate: string | null, extra: Partial<OngoingTask> = {}) => ({ id, title: `Task ${id}`, endDate, projectName: "DEMO", projectProgress: 40, creatorId: "u1", creatorName: "Ana", creatorImage: null, assignedToId: null, assignedToName: null, assignedToImage: null, ...extra }) as OngoingTask;
const thursday = new Date(2026, 10, 5, 18, 0);

it("groups consecutive actions of the same kind by the same person", () => {
 const at = (id: string, user: string, activity: string) => ({ id, user, activity, type: "audit", userImage: null, date: "2026-11-05T10:00:00Z", timestamp: 0 });
 const groups = groupActivities([at("1", "Dot", "Updated project: DEMO"), at("2", "Dot", "Deleted client: A"), at("3", "Dot", "Deleted client: B"), at("4", "Bia", "Deleted client: C"), at("5", "Dot", "Logged in")]);
 expect(groups.map(g => [g.user, g.action, g.subjects])).toEqual([["Dot", "Updated project", ["DEMO"]], ["Dot", "Deleted client", ["A", "B"]], ["Bia", "Deleted client", ["C"]], ["Dot", "Logged in", []]]);
});

it("counts overdue and due-today tasks by calendar day", () => {
 expect(taskUrgency([task("a", "2026-09-27"), task("b", "2026-11-05"), task("c", "2026-11-04T23:30:00"), task("d", null), task("e", "2026-11-09")], thursday)).toEqual({ overdue: 2, dueToday: 1, oldestLate: 39 });
});

it("lays the week out from Monday with today's tasks, follow-ups and earlier overdue work", () => {
 const lead = (id: string, name: string, at: string) => ({ id, name, status: "new", followUpAt: at });
 render(<MemoryRouter><WeekCalendar today={thursday} tasks={[task("today", "2026-11-05"), task("old", "2026-09-27"), task("tue", "2026-11-03")]} followUps={{ overdue: [lead("m", "Marina", "2026-11-03T10:00:00")], today: [lead("p", "Parket", "2026-11-05T15:00:00")], upcoming: [lead("r", "Rafael", "2026-11-06T09:30:00")] }} /></MemoryRouter>);
 const days = screen.getAllByRole("listitem").filter(li => li.classList.contains("home-day"));
 expect(days).toHaveLength(7);
 expect(days[0]).toHaveTextContent("Mon");
 const today = days.find(day => day.getAttribute("aria-current") === "date")!;
 expect(today).toHaveTextContent("5");
 expect(within(today).getByRole("link", { name: "Task today" })).toHaveAttribute("href", "/dashboard/task-management");
 expect(within(today).getByRole("link", { name: /Parket/ })).toHaveAttribute("href", "/dashboard/leads");
 expect(within(days[1]).getByRole("link", { name: /Marina/ })).toHaveAttribute("data-late");
 expect(within(days[1]).getByRole("link", { name: "Task tue" })).toHaveAttribute("data-late");
 expect(within(days[4]).getByRole("link", { name: /Rafael/ })).not.toHaveAttribute("data-late");
 expect(screen.getByRole("link", { name: "dashboard.home.overdueEarlier:1" })).toBeInTheDocument();
});

it("marks a late task and shows who is on it", () => {
 render(<MemoryRouter><OngoingTaskCard task={task("x", "2020-01-01", { assignedToId: "u2", assignedToName: "Bia" })} /></MemoryRouter>);
 const card = screen.getByRole("link");
 expect(card).toHaveAttribute("data-state", "late");
 expect(within(card).getByRole("progressbar")).toHaveAttribute("aria-valuenow", "40");
 expect(within(card).getByText("BI")).toBeInTheDocument();
 expect(within(card).getByText("AN")).toBeInTheDocument();
});
