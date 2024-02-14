import { SpawnState } from "@/enums";
import { copyToClipboard } from "@/helpers/copyToClipboard";
import { useServices, useSpawn } from "@/hooks";
import { useEthers } from "@/hooks/useEthers";
import { Button, Flex, Spin, Timeline, Typography, message } from "antd";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { useInterval } from "usehooks-ts";

export const SpawnFunds = ({
  serviceHash,
  fundRequirements,
}: {
  serviceHash: string;
  fundRequirements: { [address: string]: number };
}) => {
  const { setSpawnState } = useSpawn();

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

  const handleContinue = () => {
    setSpawnState(SpawnState.DONE);
  };

  const items = useMemo(
    () =>
      Object.keys(fundRequirements).map((address) => ({
        children: (
          <FundRequirement
            setReceivedFunds={setReceivedFunds}
            serviceHash={serviceHash}
            address={address}
            requirement={fundRequirements[address]}
          />
        ),
      })),
    [fundRequirements, serviceHash],
  );

  const hasSentAllFunds = useMemo(() => {
    if (Object.keys(fundRequirements).length === 0) return false;
    return Object.keys(receivedFunds).reduce(
      (acc: boolean, address) => acc && receivedFunds[address],
      true,
    );
  }, [fundRequirements, receivedFunds]);

  return (
    <>
      <Flex gap={8} vertical>
        <Typography.Text>Your agent needs funds!</Typography.Text>
        <Timeline items={items} />
        <Button
          type="default"
          disabled={!hasSentAllFunds}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </Flex>
    </>
  );
};

const FundRequirement = ({
  setReceivedFunds,
  serviceHash,
  address,
  requirement,
}: {
  setReceivedFunds: Dispatch<SetStateAction<{ [address: string]: boolean }>>;
  serviceHash: string;
  address: string;
  requirement: number;
}) => {
  const [isPollingBalance, setIsPollingBalance] = useState(true);
  const { getETHBalance } = useEthers();
  const { getService } = useServices();
  const rpc = useMemo(
    () => getService(serviceHash).rpc,
    [getService, serviceHash],
  );

  useInterval(
    () =>
      getETHBalance(address, rpc || "").then((balance) => {
        if (balance && balance >= requirement) {
          setIsPollingBalance(false);
          setReceivedFunds((prev: { [address: string]: boolean }) => ({
            ...prev,
            [address]: true,
          }));
        }
      }),
    isPollingBalance ? 1000 : null,
  );

  return (
    <Flex gap={8} vertical key={address}>
      <Typography.Text>
        Send {requirement} XDAI to: {address} {isPollingBalance && <Spin />}
      </Typography.Text>
      <Flex gap={8}>
        <Button
          type="primary"
          onClick={() => {
            copyToClipboard(address);
            message.success("Copied to clipboard");
          }}
        >
          Copy address
        </Button>
        <Button type="default" disabled>
          Show QR
        </Button>
      </Flex>
    </Flex>
  );
};
