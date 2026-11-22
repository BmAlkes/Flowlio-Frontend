import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PendingSignupsPanel, type PendingSignup } from "./PendingSignupsPanel";

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock("@/configs/axios.config", () => ({ axios: api }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { language: "pt" } }) }));
vi.mock("@/components/common/generalmodal", () => ({
  GeneralModal: ({ open, children }: { open?: boolean; children: React.ReactNode }) => (open ? <div role="dialog">{children}</div> : null),
}));

const person = (id: string, extra: Partial<PendingSignup> = {}): PendingSignup => ({
  id, name: id, email: `${id}@x.test`, emailVerified: true, createdAt: "2026-10-01T10:00:00Z", daysSinceSignup: 50, stage: "no_plan",
  planName: null, organizationName: null, lastSeenAt: null, reminders: 0, lastReminderAt: null, reason: null, optedOut: false, blockedBy: null, ...extra,
});
const summary = { total: 2, noPlan: 1, checkout: 1, canRemind: 1, reminded: 1, answered: 1, optedOut: 0, reasons: { price: 1, missing_feature: 0, too_complex: 0, payment_problem: 0, just_exploring: 0, other: 0 } };
const wrap = () => render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><PendingSignupsPanel /></QueryClientProvider>);
beforeEach(() => vi.clearAllMocks());
afterEach(cleanup);

it("shows why people stopped and emails only the selected eligible people after confirming", async () => {
  api.get.mockResolvedValue({ data: { data: [person("ana"), person("bia", { stage: "checkout", reason: "price", reminders: 1, lastReminderAt: "2026-11-01T10:00:00Z", blockedBy: "answered" })], summary } });
  api.post.mockResolvedValue({ data: { data: { sent: 1, skipped: [] } } });
  wrap();
  expect(await screen.findByText(/signups.reasons.price/)).toBeTruthy();
  await userEvent.click(screen.getByRole("button", { name: /signups.show/ }));
  expect((screen.getByRole("checkbox", { name: "bia@x.test" }) as HTMLButtonElement).disabled).toBe(true);
  await userEvent.click(screen.getByRole("checkbox", { name: "ana@x.test" }));
  await userEvent.click(screen.getByRole("button", { name: /signups.send/ }));
  expect(api.post).not.toHaveBeenCalled();
  await userEvent.click(await screen.findByRole("button", { name: "signups.confirmSend" }));
  await waitFor(() => expect(api.post).toHaveBeenCalledWith("/superadmin/pending-signups/remind", { userIds: ["ana"], language: "pt" }));
});

it("stays hidden for sub admins", async () => {
  api.get.mockRejectedValue({ response: { status: 403 } });
  const { container } = wrap();
  await waitFor(() => expect(api.get).toHaveBeenCalled());
  await waitFor(() => expect(container.innerHTML).toBe(""));
});
