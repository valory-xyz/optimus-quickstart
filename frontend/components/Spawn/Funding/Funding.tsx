import { Service } from '@/client';
import { COLOR } from '@/constants';
import { SpawnScreenState } from '@/enums';
import { useSpawn } from '@/hooks';
import { Address } from '@/types';
import { FundsReceivedMap, FundsRequirementMap } from '@/types';
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
  setReceivedFunds: Dispatch<SetStateAction<FundsReceivedMap>>;
  serviceHash: string;
  address: Address;
  requirement: number;
  contractAddress?: Address;
  symbol: string;
  hasReceivedFunds: boolean;
};

type FundingProps = {
  service: Service;
  fundRequirements: FundsRequirementMap;
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

  const [receivedFunds, setReceivedFunds] = useState<FundsReceivedMap>({
    ...(Object.keys(fundRequirements) as Address[]).reduce(
      (acc: FundsReceivedMap, address: Address) => {
        acc[address] = false;
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
          color: receivedFunds[address] ? COLOR.GREEN_2 : COLOR.RED,
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
