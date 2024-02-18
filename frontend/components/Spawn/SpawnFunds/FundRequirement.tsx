import { copyToClipboard } from "@/helpers/copyToClipboard";
import { useEthers, useServices, useModals } from "@/hooks";
import { message, Flex, Typography, Button } from "antd";
import {
  Dispatch,
  SetStateAction,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useInterval } from "usehooks-ts";

export const FundRequirement = ({
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
  const { getETHBalance } = useEthers();
  const { getServiceFromState } = useServices();
  const { qrModalOpen } = useModals();

  const [isPollingBalance, setIsPollingBalance] = useState(true);

  const rpc: string = useMemo(() => {
    const service = getServiceFromState(serviceHash);
    if (!service) return "";
    return service.ledger?.rpc || "";
  }, [getServiceFromState, serviceHash]);

  const handleCopy = useCallback(() => {
    copyToClipboard(address);
    message.success("Copied to clipboard");
  }, [address]);

  const handleShowQr = useCallback(
    () => qrModalOpen({ amount: requirement, chainId: 100, address }),
    [address, qrModalOpen, requirement],
  );

  useInterval(
    () =>
      getETHBalance(address, rpc).then((balance) => {
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
        Send {requirement} XDAI to: {address}
      </Typography.Text>
      <Flex gap={8}>
        <Button type="primary" onClick={handleCopy}>
          Copy address
        </Button>
        <Button type="default" onClick={handleShowQr}>
          Show QR
        </Button>
      </Flex>
    </Flex>
  );
};
