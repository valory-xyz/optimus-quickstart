import { Service } from "@/client";
import { useMulticall } from "@/hooks/useMulticall";
import { Flex, Typography } from "antd";
import { useMemo, useState } from "react";
import { useInterval } from "usehooks-ts";

const BALANCE_POLLING_INTERVAL = 5000;

export const ServiceCardTotalBalance = ({ service }: { service: Service }) => {
  const { getETHBalances } = useMulticall();
  const [balances, setBalances] = useState<{ [address: string]: number }>({});

  const sumBalances = useMemo(
    () =>
      Object.values(balances).reduce(
        (acc: number, balance: number) => (acc += balance),
        0,
      ),
    [balances],
  );

  useInterval(() => {
    if (
      service.chain_data?.instances &&
      service.chain_data?.multisig &&
      service.ledger?.rpc
    )
      getETHBalances(
        [...service.chain_data.instances, service.chain_data.multisig],
        service.ledger?.rpc,
      ).then((r) => setBalances(r));
  }, BALANCE_POLLING_INTERVAL);

  return (
    <Flex vertical>
      <Typography.Text strong>TOTAL BALANCE</Typography.Text>
      <Typography.Text>XDAI {sumBalances}</Typography.Text>
    </Flex>
  );
};
