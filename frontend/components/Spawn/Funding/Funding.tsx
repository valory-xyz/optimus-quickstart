import { Service } from '@/client';
import { SpawnScreenState } from '@/enums';
import { useSpawn } from '@/hooks';
import { Address } from '@/types';
import { FundsReceivedMap } from '@/types/Maps';
import { TimelineItemProps, Flex, Typography, Timeline } from 'antd';
import { isEmpty } from 'lodash';
import {
  useState,
  useMemo,
  useEffect,
  SetStateAction,
  Dispatch,
  ReactElement,
} from 'react';

type FundRequirementComponentProps = {
  setReceivedFunds: Dispatch<SetStateAction<{ [address: Address]: boolean }>>;
  serviceHash: string;
  address: Address;
  requirement: number;
  contractAddress?: Address;
  symbol: string;
  hasReceivedFunds: boolean;
};

type FundingProps = {
  service: Service;
  fundRequirements: { [address: Address]: number };
  FundRequirementComponent: (
    props: FundRequirementComponentProps,
  ) => ReactElement;
  nextPage: SpawnScreenState;
  symbol: string;
  contractAddress?: Address;
};

export const Funding = ({
  service,
  fundRequirements,
  FundRequirementComponent,
  nextPage,
  symbol,
  contractAddress,
}: FundingProps) => {
  const { setSpawnScreenState } = useSpawn();

  const [receivedFunds, setReceivedFunds] = useState<{
    [address: Address]: boolean;
  }>({
    ...Object.keys(fundRequirements).reduce(
      (acc: FundsReceivedMap, address) => {
        acc[address as Address] = false;
        return acc;
      },
      {},
    ),
  });

  const timelineItems: TimelineItemProps[] = useMemo(
    () =>
      (Object.keys(fundRequirements) as Address[]).map((address) => {
        return {
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
          color: receivedFunds[address] ? 'green' : 'red',
        };
      }) as TimelineItemProps[],
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
    if (isEmpty(fundRequirements)) return false;
    return (Object.keys(receivedFunds) as Address[]).reduce(
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
