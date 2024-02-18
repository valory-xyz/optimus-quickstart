import { Service } from "@/client";
import { SpawnScreenState } from "@/enums";
import { useSpawn } from "@/hooks";
import { Button, Flex, Timeline, Typography } from "antd";
import { useMemo, useState } from "react";
import { FundRequirement } from "./FundRequirement";

export const SpawnFunds = ({
  service,
  fundRequirements,
}: {
  service: Service;
  fundRequirements: { [address: string]: number };
}) => {
  const { setSpawnScreenState } = useSpawn();

  const [receivedFunds, setReceivedFunds] = useState<{
    [address: string]: boolean;
  }>({
    ...Object.keys(fundRequirements).reduce(
      (acc: { [address: string]: boolean }, address) => {
        acc[address] = false;
        return acc;
      },
      {},
    ),
  });

  const handleContinue = () => {
    setSpawnScreenState(SpawnScreenState.DONE);
  };

  const items = useMemo(
    () =>
      Object.keys(fundRequirements).map((address) => ({
        children: (
          <FundRequirement
            setReceivedFunds={setReceivedFunds}
            serviceHash={service.hash}
            address={address}
            requirement={fundRequirements[address]}
          />
        ),
      })),
    [fundRequirements, service.hash],
  );

  const hasSentAllFunds = useMemo(() => {
    if (Object.keys(fundRequirements).length === 0) return false;
    return Object.keys(receivedFunds).reduce(
      (acc: boolean, address) => acc && receivedFunds[address],
      true,
    );
  }, [fundRequirements, receivedFunds]);

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
