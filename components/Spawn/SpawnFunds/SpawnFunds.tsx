import { SpawnState } from "@/enums/SpawnState";
import { copyToClipboard } from "@/helpers/copyToClipboard";
import { useSpawn } from "@/hooks/useSpawn";
import { Button, Flex, Timeline, Typography } from "antd";
import { useMemo } from "react";

const mockRequiresFunds = [
  { amount: 0.1, currency: "xDAI", to: "0xTest", recieved: true },
];

export const SpawnFunds = ({ serviceHash }: { serviceHash: string }) => {
  const { setSpawnState } = useSpawn();

  const handleContinue = () => {
    setSpawnState(SpawnState.DONE);
  };

  const items = useMemo(
    () =>
      mockRequiresFunds.map((mock) => ({
        children: (
          <>
            <Flex gap={8} vertical key={mock.to}>
              <Typography.Text>
                Send {mock.amount} {mock.currency} to: {mock.to}
              </Typography.Text>
              <Flex gap={8}>
                <Button type="primary" onClick={() => copyToClipboard(mock.to)}>
                  Copy address
                </Button>
                <Button type="default" disabled>
                  Show QR
                </Button>
              </Flex>
            </Flex>
          </>
        ),
      })),
    [],
  );

  const hasSentAllFunds = useMemo(
    () => mockRequiresFunds.every((mock) => mock.recieved),
    [],
  );

  return (
    <>
      <Flex gap={8} vertical>
        <Typography.Text>Your agent needs funds!</Typography.Text>
        <Timeline items={items} />
        <Button
          type="default"
          disabled={!hasSentAllFunds}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </Flex>
    </>
  );
};
