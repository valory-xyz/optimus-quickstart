import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { Layout } from "./Layout";

describe("Layout", () => {
  it("should render", () => {
    const { container } = render(<Layout />)
    expect(container).toBeInTheDocument();
  });
});
