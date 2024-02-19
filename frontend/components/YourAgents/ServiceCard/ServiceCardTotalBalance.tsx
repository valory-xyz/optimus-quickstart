import { Service } from "@/client";
import { useMulticall } from "@/hooks/useMulticall";
import { Flex, Typography, message } from "antd";
import { useMemo, useState } from "react";
import { useInterval } from "usehooks-ts";

const BALANCE_POLLING_INTERVAL = 5000;

export const ServiceCardTotalBalance = ({ service }: { service: Service }) => {
  const { getETHBalances } = useMulticall();
  const [hasInitialLoaded, setHasInitialLoaded] = useState(false);
  const [balances, setBalances] = useState<{ [address: string]: number }>({});

  const sumBalances: number = useMemo(
    () =>
      hasInitialLoaded && balances
        ? Object.values(balances).reduce(
            (acc: number, balance: number) => (acc += balance),
            0,
          )
        : 0,
    [balances, hasInitialLoaded],
  );

  useInterval(() => {
    if (
      service.chain_data?.instances &&
      // service.chain_data?.multisig && // multisig not required?
      service.ledger?.rpc
    )
      getETHBalances(
        [...service.chain_data.instances], //, service.chain_data.multisig], // multisig not required?
        service.ledger.rpc,
      )
        .then((r) => {
          if (!hasInitialLoaded) setHasInitialLoaded(true);
          setBalances(r);
        })
        .catch((e) => message.error(e.message));
  }, BALANCE_POLLING_INTERVAL);

  return (
    <Flex vertical>
      <Typography.Text strong>TOTAL BALANCE</Typography.Text>
      <Typography.Text>XDAI {sumBalances}</Typography.Text>{" "}
      {/* hardcoded XDAI for now */}
    </Flex>
  );
};
