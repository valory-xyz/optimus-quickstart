import { useAgents } from "@/hooks/useAgents";
import { Tab, useTabs } from "@/hooks/useTabs";
import { Button, Flex, Typography } from "antd";

export const YourAgents = () => {
  const { agents } = useAgents();

  const hasAgents = agents && agents.length > 0;

  return <>{hasAgents ? <HasAgents agents={agents} /> : <NoAgents />}</>;
};

export const HasAgents = ({ agents }: { agents: any[] }) => {
  const { stopAgent } = useAgents();
  return (
    <>
      {agents.map((agent) => (
        <div key={agent.id}>
          <Typography.Title>{agent.name}</Typography.Title>
          <Typography.Paragraph>{agent.description}</Typography.Paragraph>
          <Button onClick={() => stopAgent(agent.id)}>Stop this agent</Button>
        </div>
      ))}
    </>
  );
};

export const NoAgents = () => {
  const { setActiveTab } = useTabs();
  return (
    <Flex
      vertical
      style={{ minWidth: "100vw", minHeight: "100vh" }}
      justify="center"
      align="center"
    >
      <p>No agents running.</p>
      <Button type="primary" onClick={() => setActiveTab(Tab.MARKETPLACE)}>
        Browse Agents
      </Button>
    </Flex>
  );
};
