import { Tab } from "@/enums/Tabs";
import { useAgents } from "@/hooks/useAgents";
import { useTabs } from "@/hooks/useTabs";
import { Button, Flex, Typography } from "antd";

export const YourAgents = () => {
  const { agents } = useAgents();

  const hasAgents = agents?.length > 0;

  return <>{hasAgents ? <HasAgents agents={agents} /> : <NoAgents />}</>;
};

export const HasAgents = ({ agents }: { agents: any[] }) => {
  const { stopAgent } = useAgents();
  return (
    <>
      {agents.map((agent) => (
        <Flex key={agent.id} vertical>
          <Typography.Title>{agent.name}</Typography.Title>
          <Typography.Paragraph>{agent.description}</Typography.Paragraph>
          <Button onClick={() => stopAgent(agent.id)}>Stop this agent</Button>
        </Flex>
      ))}
    </>
  );
};

export const NoAgents = () => {
  const { setActiveTab } = useTabs();
  return (
    <Flex vertical justify="center" align="center">
      <Typography.Text>No agents running.</Typography.Text>
      <Button type="primary" onClick={() => setActiveTab(Tab.MARKETPLACE)}>
        Browse Agents
      </Button>
    </Flex>
  );
};
