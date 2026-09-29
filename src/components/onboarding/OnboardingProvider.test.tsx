import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { OnboardingProvider } from "./OnboardingProvider";

const state = vi.hoisted(() => ({
  scope: "org-a",
  user: {role: "user", isOrganizationOwner: true, isOrganizationManager: false, organizationId: "org-a", organization: {name: "Organization A"}},
  currencies: {} as Record<string, string | null>,
  get: vi.fn(), put: vi.fn(), patch: vi.fn(),
}));
vi.mock("@/providers/user.provider", () => ({useUser: () => ({data: {user: state.user}})}));
vi.mock("@/hooks/useDataScope", () => ({useDataScope: () => state.scope}));
vi.mock("@/hooks/useuserprofile", () => ({useUserProfile: () => ({data: {data: {}}})}));
vi.mock("@/configs/axios.config", () => ({axios: {get: state.get, put: state.put, patch: state.patch}}));
vi.mock("react-i18next", () => ({useTranslation: () => ({t: (key: string) => key, i18n: {language: "pt"}})}));

beforeEach(() => {
  vi.clearAllMocks();
  state.scope = "org-a";
  state.user = {role: "user", isOrganizationOwner: true, isOrganizationManager: false, organizationId: "org-a", organization: {name: "Organization A"}};
  state.currencies = {"org-a": null, "org-b": null};
  state.get.mockImplementation(async (url: string) => {
    if (url === "/organizations/financial-settings") return {data: {data: {currencyCode: state.currencies[state.scope]}}};
    if (url !== "/onboarding") throw Error(`Unexpected endpoint: ${url}`);
    const role = state.user.isOrganizationOwner ? "admin" : state.user.isOrganizationManager ? "manager" : "member";
    const workSteps = role === "member" ? {complete_task: null, log_time: null, update_profile: null} : {create_client: null, create_project: null, approve_delivery: null};
    const steps = role === "admin" ? {configure_currency: state.currencies[state.scope] ? {completedAt: "2026-09-29"} : null, ...workSteps} : workSteps;
    return {data: {data: {role, dismissed: false, completedAt: null, steps}}};
  });
  state.put.mockImplementation(async (_url: string, body: {currencyCode: string}) => {
    state.currencies[state.scope] = body.currencyCode;
    return {data: {success: true, data: {currencyCode: body.currencyCode}}};
  });
});

function setup() {
  const client = new QueryClient({defaultOptions: {queries: {retry: false, gcTime: 0}, mutations: {retry: false}}});
  const tree = () => <QueryClientProvider client={client}><MemoryRouter><OnboardingProvider /></MemoryRouter></QueryClientProvider>;
  const view = render(tree());
  return {user: userEvent.setup(), rerender: () => view.rerender(tree())};
}

async function currencySelect() {
  const select = await screen.findByRole("combobox", {name: "core.financialSettings.currency"});
  await waitFor(() => expect(select).toBeEnabled());
  return select;
}

it("requires an explicitly saved currency and keeps the welcome open after saving", async () => {
  const {user} = setup();
  const select = await currencySelect();
  expect(select).toHaveValue("");
  const next = screen.getByRole("button", {name: "coreOnboarding.start"});
  expect(next).toBeDisabled();
  await user.selectOptions(select, "ILS");
  expect(next).toBeDisabled();
  await user.click(screen.getByRole("checkbox", {name: "core.financialSettings.confirm"}));
  await user.click(screen.getByRole("button", {name: "core.financialSettings.save"}));
  expect(await screen.findByText("coreOnboarding.currencyReady")).toHaveAttribute("role", "status");
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  expect(next).toBeEnabled();
  expect(state.put).toHaveBeenCalledWith("/organizations/financial-settings", {currencyCode: "ILS", previousCurrencyCode: null, confirm: true});
  expect(state.get).not.toHaveBeenCalledWith("/organizations/financial-settings/unresolved");
  expect(state.patch).not.toHaveBeenCalled();
  await user.click(next);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
  expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "4");
});

it("keeps the currency step incomplete after a failed or stale save", async () => {
  state.put.mockRejectedValue({response: {status: 409}});
  const {user} = setup();
  await user.selectOptions(await currencySelect(), "EUR");
  await user.click(screen.getByRole("checkbox"));
  await user.click(screen.getByRole("button", {name: "core.financialSettings.save"}));
  expect(await screen.findByRole("alert")).toHaveTextContent("core.financialSettings.saveError");
  expect(screen.getByRole("button", {name: "coreOnboarding.start"})).toBeDisabled();
  expect(state.currencies["org-a"]).toBeNull();
  expect(state.patch).not.toHaveBeenCalled();
});

it("clears an unfinished currency choice and consent when the organization changes", async () => {
  const {user, rerender} = setup();
  await user.selectOptions(await currencySelect(), "EUR");
  await user.click(screen.getByRole("checkbox"));
  state.scope = "org-b";
  state.user = {...state.user, organizationId: "org-b", organization: {name: "Organization B"}};
  rerender();
  expect(await screen.findByRole("combobox")).toHaveValue("");
  expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  expect(screen.getByRole("button", {name: "coreOnboarding.start"})).toBeDisabled();
  expect(state.put).not.toHaveBeenCalled();
});

it("allows Escape and reopens incomplete setup from the checklist", async () => {
  const {user} = setup();
  await screen.findByRole("combobox");
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", {name: "coreOnboarding.step_configure_currency"}));
  expect(await screen.findByRole("dialog")).toBeInTheDocument();
  expect(screen.getByRole("combobox")).toHaveValue("");
  expect(state.patch).not.toHaveBeenCalled();
});

it.each(["manager", "member", "client"])("does not offer organization currency setup to a %s", async role => {
  state.user = {...state.user, role: role === "client" ? "client" : "user", isOrganizationOwner: false, isOrganizationManager: role === "manager"};
  setup();
  if (role !== "client") await screen.findByRole("dialog");
  else await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  expect(state.get).not.toHaveBeenCalledWith("/organizations/financial-settings");
  expect(state.put).not.toHaveBeenCalled();
});
