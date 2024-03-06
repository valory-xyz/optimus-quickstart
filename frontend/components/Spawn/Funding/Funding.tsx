import { COLOR } from '@/constants';
import { SpawnScreen } from '@/enums';
import { useSpawn } from '@/hooks';
import { Address, FundingRecord, SpawnData } from '@/types';
import { TimelineItemProps, Flex, Typography, Timeline } from 'antd';
import { isEmpty } from 'lodash';
import {
  useMemo,
  useEffect,
  SetStateAction,
  Dispatch,
  ReactElement,
} from 'react';

type FundRequirementComponentProps = {
  setSpawnData: Dispatch<SetStateAction<SpawnData>>;
  rpc: string;
  address: Address;
  requirement: number;
  contractAddress?: Address;
  symbol: string;
  hasReceivedFunds: boolean;
};

type FundingProps = {
  fundRequirements: FundingRecord;
  FundRequirementComponent: (
    props: FundRequirementComponentProps,
  ) => ReactElement;
  nextPage: SpawnScreen;
  statement: string;
  symbol: string;
  contractAddress?: Address;
};

export const Funding = ({
  fundRequirements,
  FundRequirementComponent,
  nextPage,
  statement,
  symbol,
  contractAddress,
}: FundingProps) => {
  const { setSpawnData, rpc } = useSpawn();

  const timelineItems: TimelineItemProps[] = useMemo(
    () =>
      (Object.keys(fundRequirements) as Address[]).map((address) => {
        const { required, received } = fundRequirements[address];
        return {
          children: (
            <FundRequirementComponent
              setSpawnData={setSpawnData}
              address={address}
              requirement={required}
              symbol={symbol}
              hasReceivedFunds={received}
              contractAddress={contractAddress}
              rpc={rpc}
            />
          ),
          color: received ? COLOR.GREEN_2 : COLOR.RED,
        };
      }) as TimelineItemProps[],
    [
      FundRequirementComponent,
      contractAddress,
      fundRequirements,
      rpc,
      setSpawnData,
      symbol,
    ],
  );

  const hasSentAllFunds = useMemo(() => {
    if (isEmpty(fundRequirements)) return false;
    return (Object.keys(fundRequirements) as Address[]).reduce(
      (acc: boolean, address) => acc && fundRequirements[address].received,
      true,
    );
  }, [fundRequirements]);

  useEffect(() => {
    hasSentAllFunds && setSpawnData((prev) => ({ ...prev, screen: nextPage }));
  }, [hasSentAllFunds, nextPage, setSpawnData]);

  return (
    <>
      <Flex gap={8} vertical>
        <Typography.Text strong>{statement}</Typography.Text>
        <Timeline items={timelineItems} />
      </Flex>
    </>
  );
};
