import { Service } from '@/client';
import { useMulticall } from '@/hooks';
import { BalancesMap } from '@/types';
import { Flex, Typography, message } from 'antd';
import { useMemo, useState } from 'react';
import { useInterval } from 'usehooks-ts';

const BALANCE_POLLING_INTERVAL = 5000;

export const ServiceCardTotalBalance = ({ service }: { service: Service }) => {
  const { getEthBalances } = useMulticall();
  const [hasInitialLoaded, setHasInitialLoaded] = useState(false);
  const [balances, setBalances] = useState<BalancesMap>({});

  const sumBalances: number | undefined = useMemo(() => {
    if (hasInitialLoaded && balances) {
      return Object.values(balances).reduce(
        (acc: number, balance: number) => (acc += balance),
        0,
      );
    }
  }, [balances, hasInitialLoaded]);

  useInterval(() => {
    if (
      service.chain_data?.instances &&
      service.chain_data?.multisig &&
      service.ledger?.rpc
    )
      getEthBalances(
        [...service.chain_data.instances, service.chain_data.multisig],
        service.ledger.rpc,
      )
        .then((r) => {
          if (!hasInitialLoaded) setHasInitialLoaded(true);
          setBalances(r);
        })
        .catch((e) => message.error(e.message));
  }, BALANCE_POLLING_INTERVAL);

  return (
    sumBalances !== undefined && (
      <Flex vertical>
        <Typography.Text strong>TOTAL BALANCE</Typography.Text>
        <Typography.Text>XDAI {sumBalances}</Typography.Text>
      </Flex>
    )
  );
};
