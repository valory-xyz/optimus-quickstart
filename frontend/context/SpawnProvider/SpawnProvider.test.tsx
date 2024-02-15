import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { SpawnContext, SpawnProvider } from "./SpawnProvider";
import { SpawnScreenState } from "@/enums/SpawnState";
import "@testing-library/jest-dom";

describe("SpawnProvider", () => {
  it("renders children correctly", () => {
    const { getByTestId } = render(
      <SpawnProvider>
        <div data-testid="child">Child Component</div>
      </SpawnProvider>,
    );
    expect(getByTestId("child")).toBeInTheDocument(); // Using toBeInTheDocument matcher
  });

  it("provides default context values", () => {
    const { getByTestId } = render(
      <SpawnContext.Consumer>
        {(context) => (
          <div data-testid="context-value">{context.spawnScreenState}</div>
        )}
      </SpawnContext.Consumer>,
    );
    expect(getByTestId("context-value")).toHaveTextContent(SpawnScreenState.RPC); // Using toHaveTextContent matcher
  });

  it("updates spawn state when setSpawnState is called", () => {
    const { getByTestId } = render(
      <SpawnProvider>
        <SpawnContext.Consumer>
          {(context) => (
            <button
              data-testid="button"
              onClick={() => context.setSpawnScreenState(SpawnScreenState.LOADING)}
            >
              Update Spawn State
            </button>
          )}
        </SpawnContext.Consumer>
        <SpawnContext.Consumer>
          {(context) => (
            <div data-testid="context-value">{context.spawnScreenState}</div>
          )}
        </SpawnContext.Consumer>
      </SpawnProvider>,
    );

    // Before clicking the button, context-value should have the initial value
    expect(getByTestId("context-value")).toHaveTextContent(SpawnScreenState.RPC);

    fireEvent.click(getByTestId("button"));

    // After clicking the button, context-value should have the updated value
    expect(getByTestId("context-value")).toHaveTextContent(SpawnScreenState.LOADING);
  });
});
