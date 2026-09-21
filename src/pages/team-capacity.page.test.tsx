import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { CapacityMemberRow, type CapacityMember } from "./team-capacity.page";
import messages from "@/locales/capacity/en.json";
const api = vi.hoisted(() => ({ put: vi.fn() }));
vi.mock("@/configs/axios.config", () => ({ axios: api }));
vi.mock("@/providers/user.provider", () => ({ useUser: () => ({}) }));
vi.mock("@/hooks/useDataScope", () => ({ useDataScope: () => "scope" }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ i18n: { language: "en" }, t: (key: string) => key.startsWith("capacity.") ? messages[key.slice(9) as keyof typeof messages] : key }) }));
const member: CapacityMember = { id: "member", name: "Alex", team: "Design", availableMinutes: null, remainingMinutes: null, plannedMinutes: 420, overloaded: false, partial: true, unestimated: 1, unscheduled: 0, blocked: 1, taskCount: 1, tasks: [{ id: "task", title: "Review", projectId: "project", projectName: "Portal", blocked: true }] };
beforeEach(() => { vi.clearAllMocks(); api.put.mockResolvedValue({}); });
function setup() { render(<QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}><MemoryRouter><CapacityMemberRow member={member} /></MemoryRouter></QueryClientProvider>); return userEvent.setup(); }
it("keeps unknown availability and remaining capacity explicit", () => { setup(); expect(screen.getAllByText(messages.unknown)).toHaveLength(2); expect(screen.getByText(messages.partial)).toBeInTheDocument(); });
it("saves zero availability separately from unknown availability", async () => { const user = setup(); await user.click(screen.getByText(messages.configure)); await user.type(screen.getByLabelText(messages.weeklyHours), "0"); await user.click(screen.getByRole("button", { name: "common.save" })); await waitFor(() => expect(api.put).toHaveBeenCalledWith("/capacity/member", { weeklyMinutes: 0, team: "Design" })); });
it("keeps edited values and exposes a failed save", async () => { api.put.mockRejectedValue(new Error("Network")); const user = setup(); await user.click(screen.getByText(messages.configure)); await user.type(screen.getByLabelText(messages.weeklyHours), "32"); await user.click(screen.getByRole("button", { name: "common.save" })); expect(await screen.findByRole("alert")).toHaveTextContent(messages.saveError); expect(screen.getByLabelText(messages.weeklyHours)).toHaveValue(32); });
