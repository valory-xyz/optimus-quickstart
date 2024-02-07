import { AgentStatus } from "@/enums/AgentStatus";
import { useAgents } from "@/hooks/useAgents";
import { Agent } from "@/types/Agent";
import { Card, Flex, Typography, Button } from "antd";
import Image from "next/image";
import { useMemo } from "react";

type AgentCardProps = {
  agent: Agent;
};

export const AgentCard = ({ agent }: AgentCardProps) => {
  const { stopAgent, startAgent, deleteAgent } = useAgents();

  const button = useMemo(() => {
    if (agent.status === AgentStatus.RUNNING) {
      return (
        <Button danger onClick={() => stopAgent(agent.id)}>
          Stop this agent
        </Button>
      );
    }
    if (agent.status === AgentStatus.STOPPED) {
      return (
        <Flex gap={16}>
          <Button type="primary" onClick={() => startAgent(agent.id)}>
            Start this agent
          </Button>
          <Button danger onClick={() => deleteAgent(agent.id)}>
            Delete this agent
          </Button>
        </Flex>
      );
    }
    return null;
  }, [agent.id, agent.status, deleteAgent, startAgent, stopAgent]);

  return (
    <Card>
      <Flex gap={16}>
        <Image src={agent.image_src} alt="Image" width={200} height={200} />
        <Flex vertical>
          <Typography.Title level={3}>{agent.name}</Typography.Title>
          <Flex gap={"large"} justify="space-between">
            <Flex vertical>
              <Typography.Text strong>STATUS</Typography.Text>
              <Typography.Text>{agent.status}</Typography.Text>
            </Flex>
            <Flex vertical>
              <Typography.Text strong>EARNINGS 24H</Typography.Text>
              <Typography.Text>{agent.earnings_24h}</Typography.Text>
            </Flex>
            <Flex vertical>
              <Typography.Text strong>TOTAL BALANCE</Typography.Text>
              <Typography.Text>{agent.total_balance}</Typography.Text>
            </Flex>
          </Flex>
          <Flex style={{ marginTop: "auto" }}>{button}</Flex>
        </Flex>
      </Flex>
    </Card>
  );
};
