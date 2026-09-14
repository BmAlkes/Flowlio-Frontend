import { act, render, screen, waitFor } from "@testing-library/react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({
  session: null as any,
  profile: null as any,
  failed: false,
}));
vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: () => ({ data: state.session, isPending: false }),
    $Infer: {},
  },
}));
vi.mock("@/hooks/useuserprofile", () => ({
  useUserProfile: () => ({
    data: state.profile,
    isLoading: false,
    isError: state.failed,
  }),
  profileQueryKey: (id: string, sid: string) => [
    "user-profile",
    id ?? null,
    sid ?? null,
  ],
  fetchUserProfile: vi.fn(),
}));
vi.mock("@/hooks/usePortalActivityTracker", () => ({
  usePortalActivityTracker: vi.fn(),
}));
import { UserProvider, useUser } from "./user.provider";

describe("private cache boundary", () => {
  beforeEach(() => {
    state.session = { user: { id: "alice" }, session: { id: "s1" } };
    state.profile = {
      data: { id: "alice", role: "user", organizationId: "org-a" },
    };
    state.failed = false;
  });
  it("removes all private queries and mutations on organization/account/logout changes", async () => {
    const client = new QueryClient();
    function Consumer() {
      const { data } = useUser();
      return <span>{data?.user.organizationId ?? "anonymous"}</span>;
    }
    const tree = () => (
      <QueryClientProvider client={client}>
        <UserProvider>
          <Consumer />
        </UserProvider>
      </QueryClientProvider>
    );
    const view = render(tree());
    await screen.findByText("org-a");
    for (const transition of [
      () => {
        state.profile.data.organizationId = "org-b";
      },
      () => {
        state.session = { user: { id: "bob" }, session: { id: "s2" } };
        state.profile = { data: { id: "bob", organizationId: "org-c" } };
      },
      () => {
        state.session = null;
        state.profile = null;
      },
    ]) {
      client.setQueryData(["invoices"], "private invoices");
      client.setQueryData(["client-detail", "secret"], "private client");
      client
        .getMutationCache()
        .build(client, { mutationKey: ["private-write"] });
      transition();
      view.rerender(tree());
      await waitFor(() =>
        expect(client.getQueryData(["invoices"])).toBeUndefined(),
      );
      expect(client.getQueryData(["client-detail", "secret"])).toBeUndefined();
      expect(client.getMutationCache().getAll()).toHaveLength(0);
    }
    expect(screen.getByText("anonymous")).toBeInTheDocument();
  });
  it("does not let a late old query overwrite the new organization's data", async () => {
    const client = new QueryClient();
    let finishOld!: (value: string) => void;
    const oldRequest = new Promise<string>((resolve) => {
      finishOld = resolve;
    });
    function Consumer() {
      const { data } = useUser();
      const query = useQuery({
        queryKey: ["invoices"],
        queryFn: () =>
          data?.user.organizationId === "org-a"
            ? oldRequest
            : Promise.resolve("new invoices"),
      });
      return <span>{query.data}</span>;
    }
    const tree = () => (
      <QueryClientProvider client={client}>
        <UserProvider>
          <Consumer />
        </UserProvider>
      </QueryClientProvider>
    );
    const view = render(tree());
    state.profile = {
      data: { id: "alice", role: "user", organizationId: "org-b" },
    };
    view.rerender(tree());
    await screen.findByText("new invoices");
    await act(async () => {
      finishOld("old private invoices");
      await oldRequest;
    });
    expect(client.getQueryData(["invoices"])).toBe("new invoices");
    expect(screen.queryByText("old private invoices")).not.toBeInTheDocument();
  });
  it("removes access when profile validation fails despite a valid cookie", async () => {
    function Consumer() {
      return <span>{useUser().data?.user.id ?? "denied"}</span>;
    }
    state.failed = true;
    render(
      <QueryClientProvider client={new QueryClient()}>
        <UserProvider>
          <Consumer />
        </UserProvider>
      </QueryClientProvider>,
    );
    expect(await screen.findByText("denied")).toBeInTheDocument();
  });
});
