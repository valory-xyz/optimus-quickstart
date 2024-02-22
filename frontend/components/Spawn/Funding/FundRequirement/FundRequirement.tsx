import { copyToClipboard } from '@/common-util/copyToClipboard';
import { useModals, useServices } from '@/hooks';
import { Address } from '@/types';
import { FundsReceivedMap } from '@/types';
import { Button, Flex, Typography, message } from 'antd';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { useInterval } from 'usehooks-ts';

type FundRequirementProps = {
  serviceHash?: string;
  address: Address;
  requirement: number;
  contractAddress?: Address;
  symbol: string;
  hasReceivedFunds: boolean;
  isERC20: boolean;
  getBalance: (
    address: Address,
    rpc: string,
    contractAddress?: Address,
  ) => Promise<number>;
  setReceivedFunds: Dispatch<SetStateAction<FundsReceivedMap>>;
};

/**
 * Should be called by FundRequirementERC20 or FundRequirementETH only
 * @param { serviceHash, address, requirement, contractAddress, symbol, hasReceivedFunds, isERC20, getBalance, setReceivedFunds }
 * @returns
 */
export const FundRequirement = ({
  serviceHash,
  address,
  requirement,
  contractAddress,
  symbol,
  hasReceivedFunds,
  isERC20,
  getBalance,
  setReceivedFunds,
}: FundRequirementProps) => {
  const { qrModalOpen } = useModals();
  const { getServiceFromState } = useServices();

  const [isPollingBalance, setIsPollingBalance] = useState(true);

  const rpc: string | undefined = useMemo(() => {
    if (!serviceHash) return;
    const service = getServiceFromState(serviceHash);
    if (!service) return;
    return service.ledger?.rpc;
  }, [getServiceFromState, serviceHash]);

  const handleCopy = useCallback(
    (): Promise<void> =>
      copyToClipboard(address)
        .then(() => {
          message.success('Copied to clipboard');
        })
        .catch(() => {
          message.error('Failed to copy to clipboard');
        }),
    [address],
  );

  const handleQr = useCallback(
    (): void =>
      qrModalOpen({
        amount: requirement,
        chainId: 100,
        address,
        isErc20: isERC20,
      }), // hardcoded chainId for now
    [address, isERC20, qrModalOpen, requirement],
  );

  useInterval(
    () => {
      if (!rpc) return;
      getBalance(address, rpc, contractAddress)
        .then((balance: number) => {
          if (balance >= requirement) {
            setIsPollingBalance(false);
            setReceivedFunds((prev: FundsReceivedMap) => ({
              ...prev,
              [address]: true,
            }));
            message.success(`Funded ${address}`);
          }
        })
        .catch(() => {
          message.error(`Failed to get balance for ${address}`);
        });
    },
    isPollingBalance ? 3000 : null,
  );

  const userActionText = useMemo(
    () =>
      hasReceivedFunds
        ? `Received ${requirement} ${symbol} at: ${address}`
        : `Send ${requirement} ${symbol} to: ${address}`,
    [address, hasReceivedFunds, requirement, symbol],
  );

  return (
    <Flex gap={8} vertical key={address}>
      <Typography.Text>{userActionText}</Typography.Text>
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
