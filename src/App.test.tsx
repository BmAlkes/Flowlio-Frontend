import {
  act,
  fireEvent,
  render,
  screen,
  cleanup,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useLocation, useNavigate } from "react-router";
import type { ReactNode } from "react";
const state = vi.hoisted(() => ({
  identity: "anonymous",
  complete: null as null | (() => void),
}));
vi.mock("./providers/user.provider", () => ({
  UserProvider: ({ children }: { children: ReactNode }) => (
    <div key={state.identity}>{children}</div>
  ),
}));
vi.mock("./components/ui/sonner", () => ({ Toaster: () => null }));
vi.mock("@tanstack/react-query-devtools", () => ({
  ReactQueryDevtools: () => null,
}));
vi.mock("./router", () => ({
  AppRouter: () => {
    const navigate = useNavigate();
    const location = useLocation();
    return (
      <>
        <span>{location.pathname}</span>
        <button
          onClick={async () => {
            await new Promise<void>((resolve) => {
              state.complete = resolve;
            });
            navigate("/dashboard");
          }}
        >
          Sign in
        </button>
      </>
    );
  },
}));
import App from "./App";
afterEach(cleanup);
it("keeps login navigation alive while private content remounts for the new session", async () => {
  window.history.replaceState(null, "", "/auth/signin");
  const view = render(<App />);
  fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
  state.identity = "alice:session";
  view.rerender(<App />);
  await act(async () => {
    state.complete!();
  });
  expect(await screen.findByText("/dashboard")).toBeInTheDocument();
});
