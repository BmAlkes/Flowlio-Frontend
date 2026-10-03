import {cleanup, render, screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {MemoryRouter} from "react-router";
import {afterEach, beforeEach, expect, it, vi} from "vitest";
import ClientTasksPage from "./clienttasks.page";
import messages from "@/locales/en.json";
const state = vi.hoisted(() => ({request: vi.fn(), refreshProfile: vi.fn(), clientId: "client-a" as string | undefined, organizationId: "org-a", scope: "session-a", loading: false}));
vi.mock("@/configs/axios.config", () => ({axios: state.request}));
vi.mock("@/hooks/useDataScope", () => ({useDataScope: () => state.scope}));
vi.mock("@/providers/user.provider", () => ({useUser: () => ({data: {user: {clientId: state.clientId, organizationId: state.organizationId}}, isLoading: state.loading, refetchUser: state.refreshProfile})}));
vi.mock("react-i18next", () => ({useTranslation: () => ({i18n: {language: "en"}, t: (key: string | string[], options?: {count?: number}) => {
  for (const k of Array.isArray(key) ? key : [key]) {
    const value = k.split(".").reduce<unknown>((node, part) => node && typeof node === "object" ? (node as Record<string, unknown>)[part] : undefined, messages);
    if (typeof value === "string") return value.replace("{{count}}", String(options?.count ?? ""));
  }
  return Array.isArray(key) ? key.at(-1) : key;
}})}));
const task = {id: "task-a", title: "Review homepage", description: "Public project task", status: "todo", projectId: "project-a", projectName: "Website", startDate: "2026-10-01", endDate: "invalid-legacy-date", createdAt: "2026-10-01", updatedAt: "2026-10-01"};
const response = (tasks: unknown[]) => ({data: {data: {clientId: state.clientId, clientName: "Client A", tasks, taskCount: tasks.length}}});
beforeEach(() => {vi.clearAllMocks(); state.clientId = "client-a"; state.scope = "session-a"; state.loading = false; state.request.mockResolvedValue(response([task]));});
afterEach(cleanup);
function setup() {
  const cache = new QueryClient({defaultOptions: {queries: {retry: false}}});
  const view = () => <QueryClientProvider client={cache}><MemoryRouter><ClientTasksPage /></MemoryRouter></QueryClientProvider>;
  const rendered = render(view());
  return {cache, user: userEvent.setup(), rerender: () => rendered.rerender(view())};
}
it("lists shared tasks and opens their details with the keyboard even with a legacy invalid date", async () => {
  const {user} = setup();
  const title = await screen.findByRole("button", {name: task.title});
  title.focus(); await user.keyboard("{Enter}");
  const details = within(screen.getByRole("dialog"));
  expect(details.getByText(task.description)).toBeInTheDocument();
  expect(details.getByText(messages.common.notSet)).toBeInTheDocument();
  expect(state.request).toHaveBeenCalledWith(expect.objectContaining({method: "POST", url: "/tasks/client/client-a", data: {organizationId: "org-a"}, signal: expect.any(AbortSignal)}));
});
it("shows a failed request as an error and retries successfully instead of claiming no tasks exist", async () => {
  state.request.mockRejectedValueOnce(new Error("Network failed"));
  const {user} = setup();
  expect(await screen.findByRole("alert")).toHaveTextContent(messages.tasks.portal.loadError);
  expect(screen.queryByText(messages.tasks.portal.empty)).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", {name: messages.tasks.portal.retry}));
  expect(await screen.findByRole("button", {name: task.title})).toBeInTheDocument();
});
it("explains the sharing requirement for a genuinely empty response and refreshes new shared tasks", async () => {
  state.request.mockResolvedValueOnce(response([]));
  const {user} = setup();
  expect(await screen.findByText(messages.tasks.portal.emptyHint)).toBeInTheDocument();
  await user.click(screen.getByRole("button", {name: messages.tasks.portal.refresh}));
  expect(await screen.findByRole("button", {name: task.title})).toBeInTheDocument();
});
it("waits for the profile and offers profile recovery when the client link is missing", async () => {
  state.clientId = undefined; state.loading = true;
  const {user, rerender} = setup();
  expect(screen.getByRole("status")).toHaveTextContent(messages.tasks.loadingTasks);
  expect(state.request).not.toHaveBeenCalled();
  state.loading = false; rerender();
  expect(screen.getByRole("alert")).toHaveTextContent(messages.tasks.portal.identityError);
  await user.click(screen.getByRole("button", {name: messages.tasks.portal.retry}));
  expect(state.refreshProfile).toHaveBeenCalledOnce();
  state.clientId = "client-a"; rerender();
  expect(await screen.findByRole("button", {name: task.title})).toBeInTheDocument();
});
it("rejects malformed API data rather than rendering a successful empty list", async () => {
  state.request.mockResolvedValue({data: {success: false, data: null}});
  setup(); expect(await screen.findByRole("alert")).toHaveTextContent(messages.tasks.portal.loadError);
});
it("closes task details when refreshed access no longer returns the task", async () => {
  const {user, cache} = setup();
  await user.click(await screen.findByRole("button", {name: task.title}));
  state.request.mockResolvedValue(response([]));
  await cache.invalidateQueries({queryKey: ["client-tasks"]});
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(screen.queryByText(task.description)).not.toBeInTheDocument();
});
it("does not retain task rows or an open detail when the session changes", async () => {
  const {user, rerender} = setup();
  await user.click(await screen.findByRole("button", {name: task.title}));
  state.scope = "session-b"; state.request.mockResolvedValue(response([])); rerender();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(await screen.findByText(messages.tasks.portal.empty)).toBeInTheDocument();
});
