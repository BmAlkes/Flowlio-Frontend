import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { expect, it, vi } from "vitest";
import { useOnboarding } from "./useOnboarding";
const mocks = vi.hoisted(() => ({ scope: "org-a", get: vi.fn() }));
vi.mock("@/configs/axios.config", () => ({ axios: { get: mocks.get } }));
vi.mock("@/hooks/useDataScope", () => ({ useDataScope: () => mocks.scope }));
vi.mock("@/providers/user.provider", () => ({ useUser: () => ({ data: { user: { role: "user", organizationId: mocks.scope } } }) }));
it("does not carry completed onboarding into a different organization", async () => {
  mocks.get.mockImplementation(async () => ({ data: { data: { role: "admin", dismissed: false, completedAt: null, steps: { create_client: mocks.scope === "org-a" ? { completedAt: "2026-09-21" } : null } } } }));
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  const { result, rerender } = renderHook(useOnboarding, { wrapper });
  await waitFor(() => expect(result.current.completedSteps).toBe(1));
  mocks.scope = "org-b"; rerender(); expect(result.current.completedSteps).toBe(0);
  await waitFor(() => expect(result.current.data?.steps.create_client).toBeNull());
  expect(mocks.get).toHaveBeenCalledTimes(2);
});
