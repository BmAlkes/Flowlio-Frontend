import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { fetchCollection } from "./fetch-collection";
import { sessionScope } from "@/utils/sessionScope";
const api = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/configs/axios.config", () => ({ axios: api }));
beforeEach(() => vi.resetAllMocks());
describe("bounded collection reads", () => {
  it("collects every page and deduplicates records without dropping filters", async () => {
    api.get.mockResolvedValueOnce({ data: { data: [{ id: "a" }], pagination: { page: 1, hasMore: true } } });
    api.get.mockResolvedValueOnce({ data: { data: [{ id: "a" }, { id: "b" }], pagination: { page: 2, hasMore: false } } });
    const result = await fetchCollection("/tasks/all", { projectId: "p" });
    expect(result.data).toEqual([{ id: "a" }, { id: "b" }]);
    expect(api.get).toHaveBeenLastCalledWith("/tasks/all", expect.objectContaining({ params: { projectId: "p", page: 2, pageSize: 100 } }));
  });
  it("never turns a failed subsequent page into partial success", async () => {
    api.get.mockResolvedValueOnce({ data: { data: [{ id: "a" }], pagination: { page: 1, hasMore: true } } });
    api.get.mockRejectedValueOnce(new Error("Offline"));
    await expect(fetchCollection("/tasks/all")).rejects.toThrow("Offline");
  });
  it("rejects invalid pagination and keeps compatibility with the previous backend", async () => {
    api.get.mockResolvedValueOnce({ data: { data: [], pagination: { page: 1, hasMore: true } } });
    await expect(fetchCollection("/tasks/all")).rejects.toThrow("Invalid pagination");
    api.get.mockResolvedValueOnce({ data: { data: [{ id: "a" }] } });
    expect((await fetchCollection("/tasks/all")).data).toHaveLength(1);
  });
  it("shares fresh reads inside one scope but separates identities and organizations", async () => {
    const cache = new QueryClient();
    const fetch = vi.fn().mockResolvedValue("rows");
    const identity = { user: { id: "user" }, session: { id: "session" } };
    const a = sessionScope(identity, { id: "user", organizationId: "org-a" });
    const b = sessionScope(identity, { id: "user", organizationId: "org-b" });
    for (const scope of [a, a, b]) await cache.fetchQuery({ queryKey: ["projects", scope, {}], queryFn: fetch, staleTime: 30000 });
    expect(fetch).toHaveBeenCalledTimes(2);
    cache.clear();
  });
});
