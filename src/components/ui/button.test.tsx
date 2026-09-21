import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter, Link } from "react-router";
import { Button } from "./button";

describe("Button composed with a navigation link", () => {
  it.each([false, true])("renders the profitability link when loading=%s", isLoading => {
    render(<MemoryRouter><Button asChild isLoading={isLoading} variant="outline"><Link to="/dashboard/project/view/project-1/profitability">Project profitability</Link></Button></MemoryRouter>);
    expect(screen.getByRole("link", { name: /Project profitability/ })).toHaveAttribute("href", "/dashboard/project/view/project-1/profitability");
    expect(screen.queryByRole("button")).toBeNull();
  });
});
