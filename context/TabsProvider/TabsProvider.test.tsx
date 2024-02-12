import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { TabsContext, TabsProvider } from "./TabsProvider";
import { Tab } from "@/enums";
import "@testing-library/jest-dom";

describe("TabsProvider", () => {
  it("sets the active tab correctly", () => {
    const { getByTestId } = render(
      <TabsProvider>
        <TabsContext.Consumer>
          {(context) => (
            <div
              data-testid="active-tab"
              onClick={() => context.setActiveTab(Tab.MARKETPLACE)}
            >
              {context.activeTab}
            </div>
          )}
        </TabsContext.Consumer>
      </TabsProvider>,
    );

    // Assert that the initial active tab is Tab.YOUR_AGENTS
    expect(getByTestId("active-tab")).toHaveTextContent(Tab.YOUR_AGENTS);

    // Trigger the onClick event to change the active tab
    fireEvent.click(getByTestId("active-tab"));

    // Assert that the active tab has been updated
    expect(getByTestId("active-tab")).toHaveTextContent(Tab.MARKETPLACE);
  });
});
