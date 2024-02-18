import { copyToClipboard } from "@/helpers/copyToClipboard";
import { useModals, useServices } from "@/hooks";
import { Button, Flex, Typography, message } from "antd";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import { useInterval } from "usehooks-ts";

// Called by FundRequirementETH or FundRequirementERC20 only
export const FundRequirement = ({
  serviceHash,
  address,
  requirement,
  contractAddress,
  symbol,
  getBalance,
  setReceivedFunds,
}: {
  serviceHash?: string;
  address: string;
  requirement: number;
  contractAddress?: string;
  symbol: string;
  getBalance: (
    address: string,
    rpc: string,
    contractAddress?: string,
  ) => Promise<number>;
  setReceivedFunds: Dispatch<SetStateAction<{ [address: string]: boolean }>>;
}) => {
  const { qrModalOpen } = useModals();
  const { getServiceFromState } = useServices();

  const [isPollingBalance, setIsPollingBalance] = useState(true);

  const rpc: string = useMemo(() => {
    const service = getServiceFromState(serviceHash as string);
    if (!service) return "";
    return service.ledger?.rpc || "";
  }, [getServiceFromState, serviceHash]);

  const handleCopy = useCallback(() => {
    copyToClipboard(address);
    message.success("Copied to clipboard");
  }, [address]);

  const handleQr = useCallback(
    () => qrModalOpen({ amount: requirement, chainId: 100, address }),
    [address, qrModalOpen, requirement],
  );

  useInterval(
    () =>
      getBalance(address, rpc, contractAddress).then((balance: number) => {
        if (balance && balance >= requirement) {
          setIsPollingBalance(false);
          setReceivedFunds((prev: { [address: string]: boolean }) => ({
            ...prev,
            [address]: true,
          }));
        }
      }),
    isPollingBalance ? 3000 : null,
  );

  return (
    <Flex gap={8} vertical key={address}>
      <Typography.Text>
        Send {requirement} {symbol} to: {address}
      </Typography.Text>
      <Flex gap={8}>
        <Button type="primary" onClick={handleCopy}>
          Copy address
        </Button>
        <Button type="default" onClick={handleQr}>
          Show QR
        </Button>
      </Flex>
    </Flex>
  );
};
