import { Service } from "@/client";
import { useSpawn } from "@/hooks";
import { Flex, Timeline, TimelineItemProps, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { FundRequirement } from "./FundRequirement";
import { SpawnScreenState } from "@/enums";

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

  const items: TimelineItemProps[] = useMemo(
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
        color: receivedFunds[address] ? "green" : "red",
      })) as TimelineItemProps[],
    [fundRequirements, receivedFunds, service.hash],
  );

  const hasSentAllFunds = useMemo(() => {
    if (Object.keys(fundRequirements).length === 0) return false;
    return Object.keys(receivedFunds).reduce(
      (acc: boolean, address) => acc && receivedFunds[address],
      true,
    );
  }, [fundRequirements, receivedFunds]);

  useEffect(() => {
    hasSentAllFunds && setSpawnScreenState(SpawnScreenState.DONE);
  }, [hasSentAllFunds, setSpawnScreenState]);

  return (
    <>
      <Flex gap={8} vertical>
        <Typography.Text strong>Your agent needs funds!</Typography.Text>
        <Timeline items={items} />
      </Flex>
    </>
  );
};
