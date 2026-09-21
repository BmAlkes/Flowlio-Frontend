import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DeliveryReviewItem, type DeliveryReview } from "./DeliveryReviews";
import messages from "@/locales/delivery/en.json";
const api = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock("@/configs/axios.config", () => ({ axios: api }));
vi.mock("@/hooks/useDataScope", () => ({ useDataScope: () => "scope" }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ i18n: { language: "en" }, t: (key: string) => messages[key.replace("delivery.", "") as keyof typeof messages] ?? key }) }));
const review: DeliveryReview = { id: "review", milestoneId: "milestone", title: "Design", note: "Review design", version: "a".repeat(64), state: "pending", requestedAt: "2026-09-21T12:00:00Z", decidedAt: null, decidedBy: null, comment: null, stale: false, canDecide: true };
beforeEach(() => { vi.clearAllMocks(); api.post.mockResolvedValue({ data: {} }); });
afterEach(cleanup);
function setup(overrides: Partial<DeliveryReview> = {}) {
  const changed = vi.fn();
  render(<QueryClientProvider client={new QueryClient()}><DeliveryReviewItem projectId="project" review={{ ...review, ...overrides }} onChanged={changed} /></QueryClientProvider>);
  return { user: userEvent.setup(), changed };
}
it("approves the displayed version and refreshes only after the request", async () => {
  const { user, changed } = setup(); await user.click(screen.getByRole("button", { name: messages.approve }));
  await waitFor(() => expect(changed).toHaveBeenCalledTimes(1));
  expect(api.post).toHaveBeenCalledWith("/projects/project/delivery-reviews/review/decision", { version: review.version, state: "approved", comment: "" });
});
it("requires a meaningful comment before requesting changes", async () => {
  const { user } = setup(); await user.click(screen.getByRole("button", { name: messages.changes }));
  expect(screen.getByRole("alert")).toHaveTextContent(messages.commentRequired); expect(api.post).not.toHaveBeenCalled();
  await user.type(screen.getByLabelText(messages.comment), "Adjust spacing");
  await user.click(screen.getByRole("button", { name: messages.changes }));
  await waitFor(() => expect(api.post).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ state: "changes_requested", comment: "Adjust spacing" })));
});
it.each([{ stale: true }, { canDecide: false }, { state: "approved" as const, canDecide: false }])("does not offer decisions for an unavailable review %j", overrides => {
  setup(overrides); expect(screen.queryByRole("button", { name: messages.approve })).toBeNull();
});
it("keeps feedback after failure and refreshes the receipt status", async () => {
  api.post.mockRejectedValue(new Error("Network")); const { user, changed } = setup();
  await user.type(screen.getByLabelText(messages.comment), "Feedback"); await user.click(screen.getByRole("button", { name: messages.approve }));
  expect(await screen.findByRole("alert")).toHaveTextContent(messages.decisionError);
  expect(screen.getByLabelText(messages.comment)).toHaveValue("Feedback"); expect(changed).toHaveBeenCalled();
});
