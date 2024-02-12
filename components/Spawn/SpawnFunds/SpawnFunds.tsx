import { SpawnState } from "@/enums/SpawnState";
import { copyToClipboard } from "@/helpers/copyToClipboard";
import { useSpawn } from "@/hooks/useSpawn";
import { Button, Flex, Timeline, Typography, message } from "antd";
import { useMemo } from "react";

const mockRequiresFunds = [
  { amount: 0.1, currency: "xDAI", to: "0xTest", recieved: true },
];

export const SpawnFunds = ({
  fundRequirements,
}: {
  fundRequirements: { [address: string]: number };
}) => {
  const { setSpawnState } = useSpawn();

  const handleContinue = () => {
    setSpawnState(SpawnState.DONE);
  };

  // Temporary transformation of fundRequirements until backend updated
  const transformedFundRequirements: {
    address: string;
    required: number;
    received: boolean;
  }[] = useMemo(
    () =>
      Object.keys(fundRequirements).map((address) => ({
        address,
        required: fundRequirements[address],
        received: false,
      })),
    [fundRequirements],
  );

  const items = useMemo(
    () =>
      transformedFundRequirements.map((fundRequirement) => ({
        children: (
          <>
            <Flex gap={8} vertical key={fundRequirement.address}>
              <Typography.Text>
                Send {fundRequirement.required} XDAI to:{" "}
                {fundRequirement.address}
              </Typography.Text>
              <Flex gap={8}>
                <Button
                  type="primary"
                  onClick={() => {
                    copyToClipboard(fundRequirement.address);
                    message.success("Copied to clipboard");
                  }}
                >
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
    [transformedFundRequirements],
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
