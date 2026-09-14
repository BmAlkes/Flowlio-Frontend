import { describe, expect, it, vi } from "vitest";
import { AxiosError, isCancel } from "axios";
import { axios, setRequestScope, SESSION_ACCESS_REVOKED } from "./axios.config";

describe("requests across session boundaries", () => {
  it("rejects an old mutation response before it can update the new account's cache", async () => {
    setRequestScope("alice");
    let complete!: () => void;
    let started!: () => void;
    const sent = new Promise<void>((resolve) => {
      started = resolve;
    });
    const request = axios.post(
      "/example",
      {},
      {
        adapter: (config) =>
          new Promise((resolve) => {
            complete = () =>
              resolve({
                config,
                data: "alice-private-result",
                status: 200,
                statusText: "OK",
                headers: {},
              });
            started();
          }),
      },
    );
    await sent;
    setRequestScope("bob");
    complete();
    await expect(request.catch((error) => isCancel(error))).resolves.toBe(true);
  });

  it.each([
    ["/projects", "MEMBERSHIP_INACTIVE", 1],
    ["/projects", "RESOURCE_FORBIDDEN", 0],
    ["/user/profile", "MEMBERSHIP_INACTIVE", 0],
  ])(
    "signals authoritative revocation without looping profile requests (%s, %s)",
    async (url, code, calls) => {
      const listener = vi.fn();
      window.addEventListener(SESSION_ACCESS_REVOKED, listener);
      try {
        await axios
          .get(url, {
            adapter: async (config) => {
              throw new AxiosError("Forbidden", "403", config, undefined, {
                config,
                status: 403,
                statusText: "Forbidden",
                headers: {},
                data: { code },
              });
            },
          })
          .catch(() => {});
        expect(listener).toHaveBeenCalledTimes(calls);
      } finally {
        window.removeEventListener(SESSION_ACCESS_REVOKED, listener);
      }
    },
  );
});
