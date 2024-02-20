import { Service } from "@/client";
import { SpawnScreenState } from "@/enums";
import { useSpawn } from "@/hooks";
import { TimelineItemProps, Flex, Typography, Timeline } from "antd";
import { useState, useMemo, useEffect, SetStateAction, Dispatch } from "react";

export const Funding = ({
  service,
  fundRequirements,
  FundRequirementComponent,
  nextPage,
  symbol,
  contractAddress,
}: {
  service: Service;
  fundRequirements: { [address: string]: number };
  FundRequirementComponent: (props: {
    setReceivedFunds: Dispatch<SetStateAction<{ [address: string]: boolean }>>;
    serviceHash: string;
    address: string;
    requirement: number;
    contractAddress?: string;
    symbol: string;
    hasReceivedFunds: boolean;
  }) => JSX.Element;
  nextPage: SpawnScreenState;
  symbol: string;
  contractAddress?: string;
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
          <FundRequirementComponent
            setReceivedFunds={setReceivedFunds}
            serviceHash={service.hash}
            address={address}
            requirement={fundRequirements[address]}
            symbol={symbol}
            hasReceivedFunds={receivedFunds[address]}
            contractAddress={contractAddress}
          />
        ),
        color: receivedFunds[address] ? "green" : "red",
      })) as TimelineItemProps[],
    [
      FundRequirementComponent,
      contractAddress,
      fundRequirements,
      receivedFunds,
      service.hash,
      symbol,
    ],
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
