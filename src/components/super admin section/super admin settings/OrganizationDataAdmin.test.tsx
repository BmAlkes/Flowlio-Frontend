import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OrganizationDataAdmin } from "./OrganizationDataAdmin";

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock("@/configs/axios.config", () => ({ axios: api }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { language: "pt" } }) }));
vi.mock("@/components/common/generalmodal", () => ({
  GeneralModal: ({ open, children }: { open?: boolean; children: React.ReactNode }) => (open ? <div role="dialog">{children}</div> : null),
}));

const wrap = () => render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><OrganizationDataAdmin /></QueryClientProvider>);
beforeEach(() => vi.clearAllMocks());
afterEach(cleanup);

it("always simulates a restore before it can be applied", async () => {
  api.get.mockImplementation(async (url: string) => url === "/superadmin/organization-data"
    ? { data: { data: [{ id: "org-a", name: "Agency", subscription_status: "active", inactive_since: null, deletion_warning_sent_at: null, deletes_at: null, last_backup_at: null, backups: 1 }], autoDeleteEnabled: false } }
    : { data: { data: [{ id: "b1", kind: "scheduled", row_count: 10, size_bytes: 2048, created_at: "2026-11-20T10:00:00Z" }] } });
  api.post.mockImplementation(async (_url: string, body: { confirm: boolean }) => ({ data: { data: { dryRun: !body.confirm, preRestoreBackupId: body.confirm ? "pre" : null, tables: [{ table: "projects", before: 3, after: 2 }], warnings: [] } } }));
  wrap();
  expect(await screen.findByText("privacy.dataAdmin.autoDeleteOff")).toBeTruthy();
  await userEvent.click(await screen.findByRole("button", { name: "privacy.dataAdmin.manage" }));
  await userEvent.click(await screen.findByRole("button", { name: "privacy.dataAdmin.simulate" }));
  expect(api.post).toHaveBeenLastCalledWith("/superadmin/organizations/org-a/restore", { backupId: "b1", confirm: false });
  expect(await screen.findByText("projects")).toBeTruthy();
  await userEvent.click(screen.getByRole("button", { name: "privacy.dataAdmin.restoreNow" }));
  await waitFor(() => expect(api.post).toHaveBeenLastCalledWith("/superadmin/organizations/org-a/restore", { backupId: "b1", confirm: true }));
});

it("stays hidden for sub admins", async () => {
  api.get.mockRejectedValue({ response: { status: 403 } });
  const { container } = wrap();
  await waitFor(() => expect(api.get).toHaveBeenCalled());
  await waitFor(() => expect(container.innerHTML).toBe(""));
});
