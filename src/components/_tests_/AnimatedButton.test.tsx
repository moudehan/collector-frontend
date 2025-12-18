import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AnimatedButton from "../Button";

describe("AnimatedButton", () => {
  it("Should render the label when provided", () => {
    render(<AnimatedButton label="Click me" />);

    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("Should render children instead of label when children are provided", () => {
    render(
      <AnimatedButton label="Label">
        <span>Children content</span>
      </AnimatedButton>
    );

    expect(screen.getByText("Children content")).toBeInTheDocument();
    expect(screen.queryByText("Label")).not.toBeInTheDocument();
  });
});
