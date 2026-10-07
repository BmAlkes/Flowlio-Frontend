import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useFetchInvoices } from "./usefetchinvoices";
import { useBillableTime } from "./useTimeInvoicing";
const state = vi.hoisted(() => ({ scope: "org-a", get: vi.fn() }));
vi.mock("@/configs/axios.config", () => ({ axios: { get: state.get } }));
vi.mock("./useDataScope", () => ({ useDataScope: () => state.scope }));
beforeEach(() => { vi.clearAllMocks(); state.scope = "org-a"; });
afterEach(cleanup);
it("does not show cached invoices or billable hours from a previous organization", async () => {
  state.get.mockImplementation(async (url: string) => ({ data: { data: url === "/invoices" ? [{ id: "invoice-a" }] : { entries: [{ id: "entry-a" }] } } }));
  const cache = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const { result, rerender } = renderHook(() => ({ invoices: useFetchInvoices(), time: useBillableTime({ clientId: "client", start: "2026-10-01", end: "2026-10-31" }) }), {
    wrapper: ({ children }) => <QueryClientProvider client={cache}>{children}</QueryClientProvider>,
  });
  await waitFor(() => expect(result.current.time.data?.entries[0].id).toBe("entry-a"));
  expect(result.current.invoices.data?.data[0].id).toBe("invoice-a");
  state.scope = "org-b";
  state.get.mockImplementation(async (url: string) => ({ data: { data: url === "/invoices" ? [] : { entries: [] } } }));
  rerender();
  expect(result.current.invoices.data).toBeUndefined();
  expect(result.current.time.data).toBeUndefined();
  await waitFor(() => expect(result.current.time.data?.entries).toEqual([]));
});
