import { Service } from "@/client";
import { SpawnScreenState } from "@/enums";
import { useSpawn } from "@/hooks/useSpawn";
import { TimelineItemProps, Flex, Typography, Timeline } from "antd";
import { useState, useMemo, useEffect } from "react";
import { FundRequirementETH } from "./FundRequirement/FundRequirementETH";

export const Funding = ({
  service,
  fundRequirements,
  nextPage,
}: {
  service?: Service;
  fundRequirements: { [address: string]: number };
  nextPage: SpawnScreenState;
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

  const timelineItems: TimelineItemProps[] = useMemo(
    () =>
      Object.keys(fundRequirements).map((address) => ({
        children: (
          <FundRequirementETH
            setReceivedFunds={setReceivedFunds}
            serviceHash={service?.hash}
            address={address}
            requirement={fundRequirements[address]}
          />
        ),
        color: receivedFunds[address] ? "green" : "red",
      })) as TimelineItemProps[],
    [fundRequirements, receivedFunds, service?.hash],
  );

  const hasSentAllFunds = useMemo(() => {
    if (Object.keys(fundRequirements).length === 0) return false;
    return Object.keys(receivedFunds).reduce(
      (acc: boolean, address) => acc && receivedFunds[address],
      true,
    );
  }, [fundRequirements, receivedFunds]);

  useEffect(() => {
    hasSentAllFunds && setSpawnScreenState(nextPage);
  }, [hasSentAllFunds, nextPage, setSpawnScreenState]);

  return (
    <>
      <Flex gap={8} vertical>
        <Typography.Text strong>Your agent needs funds!</Typography.Text>
        <Timeline items={timelineItems} />
      </Flex>
    </>
  );
};
