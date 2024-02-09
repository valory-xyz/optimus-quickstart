import { AgentStatus } from "@/enums/AgentStatus";
import { useAgents } from "@/hooks/useAgents";
import { useServices } from "@/hooks/useServices";
import { Agent } from "@/types/Agent";
import { Card, Flex, Typography, Button, Badge } from "antd";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";

type AgentCardProps = {
  agent: Agent;
};

export const AgentCard = ({ agent }: AgentCardProps) => {
  const { removeAgent, updateAgentStatus } = useAgents();
  const { stopService, startService } = useServices();

  const [isStopping, setIsStopping] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = useCallback(() => {
    setIsStarting(true);
    startService(agent.serviceHash)
      .then(() => {
        updateAgentStatus(agent, AgentStatus.RUNNING);
      })
      .finally(() => {
        setIsStarting(false);
      });
  }, [agent, startService, updateAgentStatus]);

  const handleStop = useCallback(() => {
    setIsStopping(true);
    stopService(agent.serviceHash)
      .then(() => {
        updateAgentStatus(agent, AgentStatus.STOPPED);
      })
      .finally(() => {
        setIsStopping(false);
      });
  }, [agent, stopService, updateAgentStatus]);

  const button = useMemo(() => {
    if (agent.status === AgentStatus.RUNNING) {
      return (
        <Button
          danger
          onClick={handleStop}
          disabled={isStopping}
          loading={isStopping}
        >
          Stop this agent
        </Button>
      );
    }
    if (agent.status === AgentStatus.STOPPED) {
      return (
        <Flex gap={16}>
          <Button
            type="primary"
            onClick={handleStart}
            disabled={isStarting}
            loading={isStarting}
          >
            Start this agent
          </Button>
          <Button danger onClick={() => removeAgent(agent)} disabled>
            Delete this agent
          </Button>
        </Flex>
      );
    }
    return null;
  }, [agent, handleStart, handleStop, isStarting, isStopping, removeAgent]);

  const agentStatus = useMemo(() => {
    if (agent.status === AgentStatus.RUNNING) {
      return <Badge status="success" text="Running" />;
    }
    if (agent.status === AgentStatus.STOPPED) {
      return <Badge status="error" text="Stopped" />;
    }
    return "Unknown";
  }, [agent.status]);

  return (
    <Card>
      <Flex gap={16}>
        <Image src={agent.image_src} alt="Image" width={200} height={200} />
        <Flex vertical>
          <Typography.Title level={3}>{agent.name}</Typography.Title>
          <Typography.Text>{agent.description}</Typography.Text>
          <Flex gap={"large"} justify="space-between">
            <Flex vertical>
              <Typography.Text strong>STATUS</Typography.Text>
              <Typography.Text>{agentStatus}</Typography.Text>
            </Flex>
            <Flex vertical>
              <Typography.Text strong>EARNINGS 24H</Typography.Text>
              <Typography.Text>$ {agent.earnings_24h}</Typography.Text>
            </Flex>
            <Flex vertical>
              <Typography.Text strong>TOTAL BALANCE</Typography.Text>
              <Typography.Text>$ {agent.total_balance}</Typography.Text>
            </Flex>
          </Flex>
          <Flex style={{ marginTop: "auto" }}>{button}</Flex>
        </Flex>
      </Flex>
    </Card>
  );
};
