import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import AuditPage, { type AuditEvent } from "./audit.page";
import messages from "@/locales/audit/en.json";
const api = vi.hoisted(() => ({ get: vi.fn(), allowed: true }));
vi.mock("@/configs/axios.config", () => ({ axios: api }));
vi.mock("@/providers/user.provider", () => ({ useUser: () => ({ data: { user: { id: "owner", role: "user", isOrganizationOwner: api.allowed } } }) }));
vi.mock("@/hooks/useDataScope", () => ({ useDataScope: () => "scope" }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ i18n: { language: "en" }, t: (key: string) => !key.startsWith("audit.") ? key : key.split(".").slice(1).reduce<unknown>((v, k) => v && typeof v === "object" ? (v as Record<string, unknown>)[k] : undefined, messages) ?? key }) }));
const event: AuditEvent = { id: "a1", actor_kind: "human", actor_id: "owner", actor_name: "Alex", action: "project.update", resource_type: "project", resource_id: "project", project_id: "project", project_name: "Client portal", operation_id: "op1", occurred_at: "2026-09-23T10:00:00Z", changes: { status: { before: "todo", after: "completed" }, budget: { before: null, after: "123.45" } } };
beforeEach(() => { vi.clearAllMocks(); api.allowed = true; api.get.mockResolvedValue({ data: { data: { events: [event], nextCursor: null } } }); });
function setup(path = "/dashboard/settings/audit") {
  const result = render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><MemoryRouter initialEntries={[path]}><AuditPage /></MemoryRouter></QueryClientProvider>);
  return { ...result, user: userEvent.setup() };
}
it("renders recorded before/after values, nulls and the authorized project link", async () => {
  setup(); expect(await screen.findByRole("link", { name: "Client portal" })).toHaveAttribute("href", "/dashboard/project/view/project");
  expect(screen.getByText("todo")).toBeInTheDocument(); expect(screen.getByText("completed")).toBeInTheDocument(); expect(screen.getByText(messages.noValue)).toBeInTheDocument();
  expect(screen.getByText("123.45")).toBeInTheDocument(); expect(screen.queryByRole("button", { name: messages.more })).not.toBeInTheDocument();
});
it("applies filters explicitly and preserves project scope in API requests", async () => {
  const { user } = setup("/dashboard/settings/audit?projectId=project"); await screen.findByText("Client portal");
  await user.type(screen.getByLabelText(messages.person), "Alex"); expect(api.get).toHaveBeenCalledTimes(1);
  await user.selectOptions(screen.getByLabelText(messages.resource), "project"); await user.click(screen.getByRole("button", { name: messages.apply }));
  await waitFor(() => expect(api.get).toHaveBeenLastCalledWith("/audit", expect.objectContaining({ params: expect.objectContaining({ person: "Alex", projectId: "project", resourceType: "project" }) })));
});
it("loads the next cursor while retaining earlier events", async () => {
  api.get.mockImplementation(async (_url: string, config: { params: { cursor?: string } }) => ({ data: { data: config.params.cursor ? { events: [{ ...event, id: "a2", actor_name: "Sam" }], nextCursor: null } : { events: [event], nextCursor: "cursor2" } } }));
  const { user } = setup(); await user.click(await screen.findByRole("button", { name: messages.more }));
  expect(await screen.findByText("Sam")).toBeInTheDocument(); expect(screen.getByText("Alex")).toBeInTheDocument();
  expect(api.get).toHaveBeenLastCalledWith("/audit", expect.objectContaining({ params: expect.objectContaining({ cursor: "cursor2" }) }));
});
it("keeps failed requests distinct from an empty history", async () => {
  api.get.mockRejectedValue(new Error("Network")); setup(); expect(await screen.findByRole("alert")).toHaveTextContent(messages.error); expect(screen.queryByText(messages.empty)).not.toBeInTheDocument();
});
it("shows export limit failures and uses all applied filters without a page cursor", async () => {
  api.get.mockImplementation(async (url: string) => { if (url.endsWith("/export")) throw { response: { data: JSON.stringify({ code: "EXPORT_TOO_LARGE" }) } }; return { data: { data: { events: [event], nextCursor: null } } }; });
  const { user } = setup("/dashboard/settings/audit?projectId=project"); await screen.findByText("Client portal"); await user.click(screen.getByRole("button", { name: messages.export }));
  expect(await screen.findByRole("alert")).toHaveTextContent(messages.exportLimit);
  expect(api.get).toHaveBeenLastCalledWith("/audit/export", expect.objectContaining({ params: expect.objectContaining({ projectId: "project" }), responseType: "text" }));
  expect(api.get.mock.calls[api.get.mock.calls.length - 1]?.[1].params).not.toHaveProperty("cursor");
});
it("cancels an in-flight export when the page loses its scope", async () => {
  let signal: AbortSignal | undefined;
  api.get.mockImplementation(async (url: string, config: { signal: AbortSignal }) => { if (url.endsWith("/export")) { signal = config.signal; return new Promise(() => {}); } return { data: { data: { events: [event], nextCursor: null } } }; });
  const { user, unmount } = setup(); await screen.findByText("Client portal"); await user.click(screen.getByRole("button", { name: messages.export })); unmount(); expect(signal?.aborted).toBe(true);
});
it("does not request audit data for unauthorized members", () => { api.allowed = false; setup(); expect(screen.getByText(messages.forbidden)).toBeInTheDocument(); expect(api.get).not.toHaveBeenCalled(); });
