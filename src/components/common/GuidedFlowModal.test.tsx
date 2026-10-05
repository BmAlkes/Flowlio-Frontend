import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { MemoryRouter, useLocation } from "react-router";
import { GuidedFlowModal } from "./GuidedFlowModal";
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
function Location() { const location = useLocation(); return <output data-testid="location">{location.pathname}{location.search}</output>; }
const action = { label: "Create task", route: "/dashboard/task-management/create-task?projectId=project-1" };
it("keeps the new project context when continuing without invoking the alternative action", async () => {
  const close = vi.fn(), skip = vi.fn();
  render(<MemoryRouter><GuidedFlowModal open onOpenChange={close} title="Created" description="Ready" nextAction={action} onSkip={skip} /><Location /></MemoryRouter>);
  await userEvent.click(screen.getByRole("button", { name: action.label }));
  expect(screen.getByTestId("location")).toHaveTextContent(action.route);
  expect(skip).not.toHaveBeenCalled();expect(close).toHaveBeenCalledWith(false);
});
it("uses the explicit destination when declining the next step", async () => {
  const skip = vi.fn();
  render(<MemoryRouter><GuidedFlowModal open onOpenChange={vi.fn()} title="Created" description="Ready" nextAction={action} onSkip={skip} skipLabel="Open project" /></MemoryRouter>);
  await userEvent.click(screen.getByRole("button", { name: "Open project" }));
  expect(skip).toHaveBeenCalledOnce();
});
it("uses the same exit on Escape so users do not return to a submitted form", async () => {
  const skip = vi.fn();
  render(<MemoryRouter><GuidedFlowModal open onOpenChange={vi.fn()} title="Created" description="Ready" nextAction={action} onSkip={skip} /></MemoryRouter>);
  await userEvent.keyboard("{Escape}");expect(skip).toHaveBeenCalledOnce();
});
