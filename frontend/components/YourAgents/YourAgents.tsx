import { useTabs } from "@/hooks/useTabs";
import { Button } from "antd";

export const YourAgents = () => {
  const { setActiveTab } = useTabs();
  return (
    <>
      <p>No agents running.</p>
      <Button type="primary" onClick={() => setActiveTab("2")}>
        Browse Agents
      </Button>
    </>
  );
};
