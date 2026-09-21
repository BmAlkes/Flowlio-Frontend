import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WorkflowRuleRow, type WorkflowRule } from "./workflows.page";
import messages from "@/locales/workflows/en.json";
const api = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn() }));
vi.mock("@/configs/axios.config", () => ({ axios: api }));
vi.mock("@/providers/user.provider", () => ({ useUser: () => ({}) }));
vi.mock("@/hooks/useDataScope", () => ({ useDataScope: () => "scope" }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ i18n: { language: "en" }, t: (key: string) => messages[key.replace("workflows.", "") as keyof typeof messages] ?? key }) }));
const rule: WorkflowRule = { id: "rule", name: "Accepted delivery", trigger: "delivery_approved", projectStatus: null, title: "Accepted", message: "Review next milestone", enabled: false };
beforeEach(() => { vi.clearAllMocks(); api.patch.mockResolvedValue({}); api.get.mockResolvedValue({ data: { data: { sampled: 2, matches: 1 } } }); });
function setup() { render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><WorkflowRuleRow rule={rule} /></QueryClientProvider>); return userEvent.setup(); }
it("simulation reads a preview without enabling the rule", async () => { const user = setup(); await user.click(screen.getByRole("button", { name: messages.simulate })); expect(await screen.findByRole("status")).toHaveTextContent(messages.simulation); expect(api.get).toHaveBeenCalledWith("/workflows/rule/simulate"); expect(api.patch).not.toHaveBeenCalled(); });
it("enables only after an explicit action", async () => { const user = setup(); expect(api.patch).not.toHaveBeenCalled(); await user.click(screen.getByRole("button", { name: messages.enable })); await waitFor(() => expect(api.patch).toHaveBeenCalledWith("/workflows/rule", { enabled: true })); });
it("keeps a failed activation visible without claiming enabled", async () => { api.patch.mockRejectedValue(new Error("Network")); const user = setup(); await user.click(screen.getByRole("button", { name: messages.enable })); expect(await screen.findByRole("alert")).toHaveTextContent(messages.error); expect(screen.getByText(messages.paused)).toBeInTheDocument(); });
