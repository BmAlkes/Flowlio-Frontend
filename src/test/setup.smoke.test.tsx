import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

describe("test environment", () => {
  it("renders a component with jsdom + testing-library", () => {
    render(<button>Click me</button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });
});
