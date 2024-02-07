import { useModals } from "@/hooks/useModals";
import { Flex, Modal } from "antd";
import { useState } from "react";

type AgentKey = {
  key: string;
};

export const AgentKeysModal = () => {
  const { agentKeysModalOpen, setAgentKeysModalOpen } = useModals();
  const [agentKeys, setAgentKeys] = useState<AgentKey[]>([]);
  return (
    <Modal
      open={agentKeysModalOpen}
      onCancel={() => setAgentKeysModalOpen(false)}
      title={"Agent Keys"}
    >
      <Flex vertical>
        {agentKeys.map((agentKey: AgentKey) => (
          <div key={agentKey.key}>{agentKey.key}</div>
        ))}
      </Flex>
    </Modal>
  );
};
