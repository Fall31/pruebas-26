import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

afterEach(cleanup);

describe("React test setup", () => {
  it("renders a React component in the DOM", () => {
    function ExampleComponent() {
      return <h1>React test environment configured</h1>;
    }

    render(<ExampleComponent />);

    expect(
      screen.getByRole("heading", { name: "React test environment configured" }),
    ).toBeInTheDocument();
  });
});
