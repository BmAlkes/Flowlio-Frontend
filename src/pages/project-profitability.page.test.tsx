import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProjectProfitabilityPage, { ProfitabilityContent } from "./project-profitability.page";
import messages from "@/locales/profitability/en.json";
const mocks = vi.hoisted(() => ({ get: vi.fn(), put: vi.fn(), user: { role: "user", isOrganizationOwner: true } }));
vi.mock("@/configs/axios.config", () => ({ axios: mocks }));
vi.mock("@/providers/user.provider", () => ({ useUser: () => ({ data: { user: mocks.user } }) }));
vi.mock("@/hooks/useDataScope", () => ({ useDataScope: () => "scope" }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ i18n: { language: "en" }, t: (key: string) => messages[key.replace("profitability.", "") as keyof typeof messages] ?? key }) }));
beforeEach(() => { vi.clearAllMocks(); mocks.user = { role: "user", isOrganizationOwner: true }; });
afterEach(cleanup);
function setup() {
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><MemoryRouter initialEntries={["/project/p"]}><Routes><Route path="/project/:id" element={<ProjectProfitabilityPage />} /></Routes></MemoryRouter></QueryClientProvider>);
  return userEvent.setup();
}
it("does not fetch internal finances for a member", () => {
  mocks.user.isOrganizationOwner = false; setup();
  expect(screen.getByText(messages.forbidden)).toBeTruthy(); expect(mocks.get).not.toHaveBeenCalled();
});
it("requires explicit currency assumptions before saving costs", async () => {
  mocks.get.mockResolvedValue({ data: { data: { projectName: "Project", settings: null } } });
  mocks.put.mockResolvedValue({ data: {} });
  const user = setup();
  await user.type(await screen.findByLabelText(messages.currency), "usd");
  await user.type(screen.getByLabelText(messages.hourlyCost), "25");
  await user.click(screen.getByRole("button", { name: "common.save" }));
  expect(mocks.put).not.toHaveBeenCalled();
  await user.click(screen.getByRole("checkbox"));
  await user.click(screen.getByRole("button", { name: "common.save" }));
  await waitFor(() => expect(mocks.put).toHaveBeenCalledWith("/projects/p/financial-settings", { currency: "USD", hourlyCost: "25", confirmCurrency: true }));
});
it("shows unknown profit and excluded currencies without inventing a total", () => {
  render(<ProfitabilityContent report={{ projectName: "Project", settings: { currency: "USD", hourlyCost: null }, revenue: "1000", expenses: "100", laborCost: null, estimatedProfit: null, complete: false, minutes: 120, unbilledMinutes: 120, unbilledValue: "160", otherCurrencies: [{ currency: "EUR", amount: "50" }] }} />);
  expect(screen.getByRole("status")).toHaveTextContent(messages.incomplete);
  expect(screen.getAllByText("—")).toHaveLength(2);
  expect(screen.getByText("€50.00")).toBeTruthy();
  expect(screen.queryByText("$1,050.00")).toBeNull();
});
