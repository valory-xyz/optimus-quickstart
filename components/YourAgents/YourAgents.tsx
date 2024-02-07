import { Tab } from "@/enums/Tabs";
import { useAgents } from "@/hooks/useAgents";
import { useTabs } from "@/hooks/useTabs";
import { Button, Flex, Typography } from "antd";
import { AgentCard } from "./AgentCard/AgentCard";

export const YourAgents = () => {
  const { agents } = useAgents();

  const hasAgents = agents?.length > 0;

  return <>{hasAgents ? <HasAgents agents={agents} /> : <NoAgents />}</>;
};

export const HasAgents = ({ agents }: { agents: any[] }) => {
  const { stopAgent } = useAgents();
  return (
    <Flex vertical gap={16}>
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </Flex>
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
