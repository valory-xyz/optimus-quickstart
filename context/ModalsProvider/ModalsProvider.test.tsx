import React, { useContext } from "react";
import { render, fireEvent } from "@testing-library/react";
import { ModalsContext, ModalsProvider } from "./ModalsProvider";

describe("ModalsProvider", () => {
  it("renders children properly", () => {
    const ChildComponent = () => {
      const { qrModalOpen } = useContext(ModalsContext);
      return <div data-testid="child">{qrModalOpen.toString()}</div>;
    };

    const { getByTestId } = render(
      <ModalsProvider>
        <ChildComponent />
      </ModalsProvider>,
    );

    expect(getByTestId("child").textContent).toBe("false");
  });

  it("correctly sets qrModalOpen value", () => {
    const ChildComponent = () => {
      const { qrModalOpen, setQrModalOpen } = useContext(ModalsContext);
      return (
        <button
          data-testid="toggle"
          onClick={() => setQrModalOpen(!qrModalOpen)}
        >
          {qrModalOpen ? "open" : "closed"}
        </button>
      );
    };

    const { getByTestId } = render(
      <ModalsProvider>
        <ChildComponent />
      </ModalsProvider>,
    );

    const toggleButton = getByTestId("toggle");

    // Initially, qrModalOpen should be false
    expect(toggleButton.textContent).toBe("closed");

    // Click the button to toggle qrModalOpen
    fireEvent.click(toggleButton);

    // Now, qrModalOpen should be true
    expect(toggleButton.textContent).toBe("open");

    // Click the button again to toggle qrModalOpen back to false
    fireEvent.click(toggleButton);

    // Now, qrModalOpen should be false again
    expect(toggleButton.textContent).toBe("closed");
  });
});
