import { COLOR } from '@/constants';
import { SpawnScreen } from '@/enums';
import { useSpawn } from '@/hooks';
import { Address, AddressNumberRecord } from '@/types';
import { AddressBooleanRecord } from '@/types';
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
  setReceivedFunds: Dispatch<SetStateAction<AddressBooleanRecord>>;
  rpc: string;
  address: Address;
  requirement: number;
  contractAddress?: Address;
  symbol: string;
  hasReceivedFunds: boolean;
};

type FundingProps = {
  fundRequirements: AddressNumberRecord;
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

  const [receivedFunds, setReceivedFunds] = useState<AddressBooleanRecord>({
    ...(Object.keys(fundRequirements) as Address[]).reduce(
      (acc: AddressBooleanRecord, address: Address) => {
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
              address={address}
              requirement={fundRequirements[address]}
              symbol={symbol}
              hasReceivedFunds={receivedFunds[address]}
              contractAddress={contractAddress}
              rpc={rpc}
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
      rpc,
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
