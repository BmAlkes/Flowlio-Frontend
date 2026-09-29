import {cleanup, render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {afterEach, beforeEach, expect, it, vi} from "vitest";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {MemoryRouter, useLocation} from "react-router";
import {DeliveryReviews} from "./DeliveryReviews";
import type {DeliveryReview, ReviewList} from "./deliveryReviewTypes";
import messages from "@/locales/delivery/en.json";

const api = vi.hoisted(() => ({get: vi.fn(), post: vi.fn()}));
const session = vi.hoisted(() => ({scope: "organization-one"}));
vi.mock("@/configs/axios.config", () => ({axios: api}));
vi.mock("@/hooks/useDataScope", () => ({useDataScope: () => session.scope}));
vi.mock("react-i18next", () => ({useTranslation: () => ({i18n: {language: "en"}, t: (key: string) => messages[key.replace("delivery.", "") as keyof typeof messages] ?? key})}));
const milestone = {id: "milestone", title: "Homepage design", version: "a".repeat(64)};
const review: DeliveryReview = {id: "review", milestoneId: milestone.id, title: milestone.title, note: "Please review", version: milestone.version, state: "pending", requestedAt: "2026-09-29T12:00:00Z", decidedAt: null, decidedBy: null, comment: null, stale: false, canDecide: false};
const data: ReviewList = {reviews: [], page: 1, hasMore: false, canRequest: true, hasClient: true, milestonesTruncated: false, milestones: [milestone], client: {id: "client", name: "Acme", portalReady: true}};
beforeEach(() => {vi.clearAllMocks(); session.scope = "organization-one"; api.get.mockResolvedValue({data: {data}});});
afterEach(cleanup);
function Location() {return <span data-testid="location">{useLocation().search}</span>;}
function setup(route = "/dashboard/project/view/project") {
  const cache = new QueryClient({defaultOptions: {queries: {retry: false}, mutations: {retry: false}}});
  const invalidations = vi.spyOn(cache, "invalidateQueries");
  const view = () => <QueryClientProvider client={cache}><MemoryRouter initialEntries={[route]}><DeliveryReviews projectId="project" /><Location /></MemoryRouter></QueryClientProvider>;
  const result = render(view());
  return {cache, invalidations, user: userEvent.setup(), rerender: () => result.rerender(view())};
}
it("offers an actionable empty state without irrelevant pagination", async () => {
  setup();
  expect(await screen.findByText(messages.empty)).toBeInTheDocument();
  expect(screen.getByRole("button", {name: messages.request})).toBeEnabled();
  expect(screen.queryByRole("button", {name: messages.previous})).not.toBeInTheDocument();
  expect(screen.queryByRole("button", {name: messages.next})).not.toBeInTheDocument();
});
it("creates a milestone, publishes the request and refreshes related queues", async () => {
  let current: ReviewList = {...data, milestones: []};
  api.get.mockImplementation(async () => ({data: {data: current}}));
  api.post.mockImplementation(async (path: string, body: {note: string}) => {
    if (path.endsWith("/milestones")) {current = {...data}; return {data: {data: milestone}};}
    current = {...data, reviews: [{...review, note: body.note}], milestones: [{...milestone, currentReview: {id: review.id, state: "pending"}}]};
    return {data: {data: {id: review.id, existing: false}}};
  });
  const {user, invalidations} = setup();
  await user.click(await screen.findByRole("button", {name: messages.createMilestone}));
  await user.type(screen.getByLabelText(messages.milestoneTitle), milestone.title);
  await user.click(screen.getByRole("button", {name: messages.createMilestone}));
  await user.type(await screen.findByLabelText(messages.note), "Please review");
  await user.click(screen.getByRole("button", {name: messages.sendRequest}));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(screen.getByText("Please review")).toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent(messages.requested);
  for (const key of ["client-pending", "attention", "onboarding"]) expect(invalidations).toHaveBeenCalledWith({queryKey: [key]});
});
it("clears an old deep-link after sending and preserves unrelated URL filters", async () => {
  api.post.mockResolvedValue({data: {data: {id: "new-review", existing: false}}});
  const {user} = setup("/dashboard/project/view/project?reviewId=old-review&tab=activity");
  await user.click(await screen.findByRole("button", {name: messages.request}));
  await user.selectOptions(screen.getByLabelText(messages.milestone), milestone.id);
  await user.type(screen.getByLabelText(messages.note), "Review current delivery");
  await user.click(screen.getByRole("button", {name: messages.sendRequest}));
  await waitFor(() => expect(screen.getByTestId("location")).toHaveTextContent("?tab=activity"));
  expect(screen.getByTestId("location")).not.toHaveTextContent("reviewId");
  expect(api.get).toHaveBeenLastCalledWith("/projects/project/delivery-reviews", {params: {page: 1, reviewId: undefined}});
});
it("lets a client return from a linked request to all reviews without offering request creation", async () => {
  api.get.mockResolvedValue({data: {data: {...data, canRequest: false, milestones: [], reviews: [{...review, canDecide: true}]}}});
  const {user} = setup("/clients/projects/view/project?reviewId=review&tab=activity");
  await user.click(await screen.findByRole("button", {name: messages.allReviews}));
  expect(screen.getByTestId("location")).toHaveTextContent("?tab=activity");
  expect(screen.queryByRole("button", {name: messages.request})).not.toBeInTheDocument();
  expect(screen.getByRole("button", {name: messages.approve})).toBeInTheDocument();
});
it("closes drafts and loads a separate cache when the organization changes", async () => {
  const {user, rerender} = setup();
  await user.click(await screen.findByRole("button", {name: messages.request}));
  await user.type(screen.getByLabelText(messages.note), "Private draft");
  session.scope = "organization-two";
  rerender();
  await screen.findByText(messages.empty);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(api.get).toHaveBeenCalledTimes(2);
  await user.click(screen.getByRole("button", {name: messages.request}));
  expect(screen.getByLabelText(messages.note)).toHaveValue("");
});
