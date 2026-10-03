import {cleanup, render, screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {afterEach, beforeEach, expect, it, vi} from "vitest";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {MemoryRouter} from "react-router";
import {DeliveryRequestDialog} from "./DeliveryRequestDialog";
import type {ReviewList} from "./deliveryReviewTypes";
import messages from "@/locales/delivery/en.json";

const api = vi.hoisted(() => ({post: vi.fn(), patch: vi.fn()}));
vi.mock("@/configs/axios.config", () => ({axios: api}));
vi.mock("react-i18next", () => ({useTranslation: () => ({t: (key: string) => messages[key.replace("delivery.", "") as keyof typeof messages] ?? key})}));
const milestone = {id: "milestone", title: "Homepage design", version: "a".repeat(64), dueDate: "2026-10-15", currentReview: null};
const data: ReviewList = {reviews: [], page: 1, hasMore: false, canRequest: true, hasClient: true, milestonesTruncated: false, milestones: [milestone], client: {id: "client", name: "Acme", portalReady: true}};
beforeEach(() => {vi.clearAllMocks(); api.post.mockResolvedValue({data: {data: {id: "review", existing: false}}});});
afterEach(cleanup);
function setup(initialData: ReviewList = data) {
  const callbacks = {onClose: vi.fn(), onRequested: vi.fn().mockResolvedValue(undefined), onRefresh: vi.fn().mockResolvedValue(initialData), onOpenReview: vi.fn()};
  const cache = new QueryClient({defaultOptions: {queries: {retry: false}, mutations: {retry: false}}});
  const view = (current: ReviewList) => <QueryClientProvider client={cache}><MemoryRouter><DeliveryRequestDialog projectId="project" data={current} open {...callbacks} /></MemoryRouter></QueryClientProvider>;
  const rendered = render(view(initialData));
  return {...callbacks, user: userEvent.setup(), rerender: (current: ReviewList) => rendered.rerender(view(current))};
}
async function fill(user: ReturnType<typeof userEvent.setup>) {
  await user.selectOptions(screen.getByLabelText(messages.milestone), milestone.id);
  await user.type(screen.getByLabelText(messages.note), "  Please review the homepage  ");
}
it("requests the displayed milestone and recipient with trimmed instructions", async () => {
  const {user, onRequested, onClose} = setup();
  await fill(user);
  await user.click(screen.getByRole("button", {name: messages.sendRequest}));
  await waitFor(() => expect(onRequested).toHaveBeenCalledWith("review", false));
  expect(api.post).toHaveBeenCalledWith("/projects/project/delivery-reviews", {milestoneId: milestone.id, version: milestone.version, clientId: "client", note: "Please review the homepage", completeMilestone: true});
  expect(onClose).toHaveBeenCalledOnce();
});
it("creates a missing milestone and then sends its first review without leaving the dialog", async () => {
  const created = {...milestone, title: "First delivery"};
  api.post.mockImplementation(async (path: string) => ({data: {data: path.endsWith("/milestones") ? created : {id: "review", existing: false}}}));
  const {user, onRefresh, onRequested, rerender} = setup({...data, milestones: []});
  onRefresh.mockResolvedValue({...data, milestones: [created]});
  await user.type(screen.getByLabelText(messages.milestoneTitle), created.title);
  await user.click(screen.getByRole("button", {name: messages.createMilestone}));
  await screen.findByLabelText(messages.note);
  rerender({...data, milestones: [created]});
  expect(api.post).toHaveBeenCalledWith("/projects/project/milestones", {title: created.title, dueDate: null});
  expect(screen.getByLabelText(messages.milestone)).toHaveValue(created.id);
  await user.type(screen.getByLabelText(messages.note), "Review first delivery");
  await user.click(screen.getByRole("button", {name: messages.sendRequest}));
  await waitFor(() => expect(onRequested).toHaveBeenCalledWith("review", false));
});
it("edits an already requested milestone with a version guard and can request its new version", async () => {
  api.patch.mockResolvedValue({data: {data: milestone}});
  const next = {...milestone, title: "Revised homepage", version: "b".repeat(64), dueDate: null};
  const {user, onRefresh, rerender} = setup({...data, milestones: [{...milestone, currentReview: {id: "old", state: "changes_requested"}}]});
  onRefresh.mockResolvedValue({...data, milestones: [next]});
  await user.selectOptions(screen.getByLabelText(messages.milestone), milestone.id);
  await user.click(screen.getByRole("button", {name: messages.editMilestone}));
  await user.clear(screen.getByLabelText(messages.milestoneTitle));
  await user.type(screen.getByLabelText(messages.milestoneTitle), next.title);
  await user.clear(screen.getByLabelText(messages.dueDateOptional));
  await user.click(screen.getByRole("button", {name: messages.saveMilestone}));
  await screen.findByLabelText(messages.note);
  expect(api.patch).toHaveBeenCalledWith("/projects/project/milestones/milestone", {title: next.title, dueDate: null, version: milestone.version});
  rerender({...data, milestones: [next]});
  await user.type(screen.getByLabelText(messages.note), "Review the revised delivery");
  await user.click(screen.getByRole("button", {name: messages.sendRequest}));
  await waitFor(() => expect(api.post).toHaveBeenCalledWith("/projects/project/delivery-reviews", expect.objectContaining({version: next.version})));
});
it("requires explicit acceptance when a refetch changes the selected milestone", async () => {
  const {user, rerender} = setup();
  await fill(user);
  const next = {...milestone, version: "b".repeat(64)};
  rerender({...data, milestones: [next]});
  expect(screen.getByRole("button", {name: messages.sendRequest})).toBeDisabled();
  expect(screen.getByRole("alert")).toHaveTextContent(messages.sourceChanged);
  expect(api.post).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", {name: messages.useCurrentMilestone}));
  await user.click(screen.getByRole("button", {name: messages.sendRequest}));
  await waitFor(() => expect(api.post).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({version: next.version})));
});
it("does not silently send a draft to a replacement client", async () => {
  const {user, rerender} = setup();
  await fill(user);
  rerender({...data, client: {id: "replacement", name: "New client", portalReady: true}});
  expect(screen.getByRole("button", {name: messages.sendRequest})).toBeDisabled();
  expect(screen.getByRole("alert")).toHaveTextContent(messages.clientChanged);
  expect(screen.getByText("Acme")).toBeInTheDocument();
  expect(api.post).not.toHaveBeenCalled();
});
it.each([
  {hasClient: false, client: null, requestBlockReason: "CLIENT_REQUIRED" as const, message: messages.noClient, link: "/dashboard/project/edit/project"},
  {hasClient: true, client: {...data.client!, portalReady: false}, requestBlockReason: "CLIENT_PORTAL_REQUIRED" as const, message: messages.portalRequired, link: "/dashboard/client-management/client"},
])("explains and blocks unavailable recipients: $requestBlockReason", async ({message, link, ...blocked}) => {
  const {user} = setup({...data, ...blocked});
  await fill(user);
  expect(screen.getByText(message)).toBeInTheDocument();
  expect(screen.getByRole("link")).toHaveAttribute("href", link);
  expect(screen.getByRole("button", {name: messages.sendRequest})).toBeDisabled();
  expect(api.post).not.toHaveBeenCalled();
});
it("opens an existing request instead of silently discarding new instructions", async () => {
  const {user, onOpenReview} = setup({...data, milestones: [{...milestone, currentReview: {id: "existing", state: "pending"}}]});
  await fill(user);
  expect(screen.getByRole("button", {name: messages.sendRequest})).toBeDisabled();
  await user.click(screen.getByRole("button", {name: messages.openExistingReview}));
  expect(onOpenReview).toHaveBeenCalledWith("existing");
  expect(api.post).not.toHaveBeenCalled();
});
it("preserves instructions on failure and refetches the current version", async () => {
  api.post.mockRejectedValue({response: {data: {code: "SOURCE_CHANGED"}}});
  const {user, onRefresh, onClose} = setup();
  await fill(user);
  await user.click(screen.getByRole("button", {name: messages.sendRequest}));
  expect(await screen.findByRole("alert")).toHaveTextContent(messages.sourceChanged);
  expect(screen.getByLabelText(messages.note)).toHaveValue("  Please review the homepage  ");
  expect(onRefresh).toHaveBeenCalledOnce();
  expect(onClose).not.toHaveBeenCalled();
});
it("does not send whitespace-only instructions or lose milestone edits on save failure", async () => {
  api.patch.mockRejectedValue({response: {data: {code: "SOURCE_CHANGED"}}});
  const {user} = setup();
  await user.selectOptions(screen.getByLabelText(messages.milestone), milestone.id);
  await user.type(screen.getByLabelText(messages.note), "   ");
  expect(screen.getByRole("button", {name: messages.sendRequest})).toBeDisabled();
  await user.click(screen.getByRole("button", {name: messages.editMilestone}));
  await user.type(screen.getByLabelText(messages.milestoneTitle), " revised");
  await user.click(screen.getByRole("button", {name: messages.saveMilestone}));
  expect(await within(screen.getByRole("dialog")).findByRole("alert")).toHaveTextContent(messages.milestoneChanged);
  expect(screen.getByLabelText(messages.milestoneTitle)).toHaveValue("Homepage design revised");
  expect(api.post).not.toHaveBeenCalled();
});
it("keeps the dialog open while a milestone is being saved", async () => {
  let finish!: (value: unknown) => void;
  api.post.mockImplementation(() => new Promise(resolve => {finish = resolve;}));
  const {user, onClose, onRefresh, rerender} = setup({...data, milestones: []});
  onRefresh.mockResolvedValue(data);
  await user.type(screen.getByLabelText(messages.milestoneTitle), milestone.title);
  await user.click(screen.getByRole("button", {name: messages.createMilestone}));
  await waitFor(() => expect(api.post).toHaveBeenCalledOnce());
  await user.keyboard("{Escape}");
  expect(onClose).not.toHaveBeenCalled();
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  finish({data: {data: milestone}});
  await screen.findByLabelText(messages.note);
  rerender(data);
  await user.click(screen.getByRole("button", {name: messages.cancel}));
  expect(onClose).toHaveBeenCalledOnce();
});
