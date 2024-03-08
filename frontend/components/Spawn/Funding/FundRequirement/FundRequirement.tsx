import { copyToClipboard } from '@/common-util/copyToClipboard';
import { useModals } from '@/hooks';
import { Address, SpawnData } from '@/types';
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
  rpc: string;
  address: Address;
  requirement: number;
  contractAddress?: Address;
  symbol: string;
  hasReceivedFunds: boolean;
  isErc20: boolean;
  getBalance: (
    address: Address,
    rpc: string,
    contractAddress?: Address,
  ) => Promise<number>;
  setSpawnData: Dispatch<SetStateAction<SpawnData>>;
};

/**
 * Should be called by FundRequirementERC20 or FundRequirementETH only
 * @param { serviceHash, address, requirement, contractAddress, symbol, hasReceivedFunds, isERC20, getBalance, setReceivedFunds }
 * @returns
 */
export const FundRequirement = ({
  rpc,
  address,
  requirement,
  contractAddress,
  symbol,
  hasReceivedFunds,
  isErc20,
  getBalance,
  setSpawnData,
}: FundRequirementProps) => {
  const { qrModalOpen } = useModals();

  const [isPollingBalance, setIsPollingBalance] = useState(true);

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
        isErc20,
      }), // hardcoded chainId for now
    [address, isErc20, qrModalOpen, requirement],
  );

  useInterval(
    () => {
      if (!rpc) return;
      getBalance(address, rpc, contractAddress)
        .then((balance: number) => {
          if (balance >= requirement) {
            setIsPollingBalance(false);
            setSpawnData((prev: SpawnData) => {
              // update agent fund requirements
              if (prev.agentFundRequirements[address]) {
                return {
                  ...prev,
                  agentFundRequirements: {
                    ...prev.agentFundRequirements,
                    [address]: {
                      ...prev.agentFundRequirements[address],
                      received: true,
                    },
                  },
                };
              }
              // update master wallet fund requirements
              if (prev.masterWalletFundRequirements[address]) {
                return {
                  ...prev,
                  masterWalletFundRequirements: {
                    ...prev.masterWalletFundRequirements,
                    [address]: {
                      ...prev.masterWalletFundRequirements[address],
                      received: true,
                    },
                  },
                };
              }
              // do nothing
              return prev;
            });
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
