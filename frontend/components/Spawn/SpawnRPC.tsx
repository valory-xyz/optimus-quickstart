import {
  Button,
  Flex,
  Input,
  Spin,
  Timeline,
  TimelineItemProps,
  Typography,
  message,
} from 'antd';
import { NODIES_URL } from '@/constants/urls';
import { ReactElement, useCallback, useMemo, useState } from 'react';
import { useSpawn, useAppInfo } from '@/hooks';
import { CheckSquareTwoTone, WarningFilled } from '@ant-design/icons';
import { InputStatus } from 'antd/es/_util/statusUtils';
import { debounce } from 'lodash';
import EthersService from '@/service/Ethers';
import { SpawnScreen } from '@/enums';

enum RPCState {
  LOADING,
  VALID,
  INVALID,
}

export const SpawnRPC = ({ nextPage }: { nextPage: SpawnScreen }) => {
  const { setSpawnData, rpc } = useSpawn();
  const { userPublicKey } = useAppInfo();

  const [isCheckingRpc, setIsCheckingRpc] = useState(false);
  const [rpcState, setRpcState] = useState<RPCState>(RPCState.INVALID);

  const handlePaste = useCallback(
    async (): Promise<void> =>
      navigator.clipboard
        .readText()
        .then((text) => setSpawnData((prev) => ({ ...prev, rpc: text })))
        .catch(() => {
          message.error('Failed to read clipboard');
        }),
    [setSpawnData],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceCheckRpc = useCallback(
    debounce((_rpc: string) => {
      if (isCheckingRpc) return;
      if (!_rpc || rpc.slice(0, 4) !== 'http') {
        setRpcState(RPCState.INVALID);
        return;
      }
      setIsCheckingRpc(true);
      EthersService.checkRpc(_rpc)
        .then((valid: boolean) =>
          setRpcState(valid ? RPCState.VALID : RPCState.INVALID),
        )
        .catch(() => {
          setRpcState(RPCState.INVALID);
          message.error('Failed to check RPC');
        })
        .finally(() => setIsCheckingRpc(false));
    }, 1000),
    [],
  );

  const handleRpcChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rpc = e.target.value;
      setSpawnData((prev) => ({ ...prev, rpc }));
      setRpcState(RPCState.LOADING);
      debounceCheckRpc(rpc);
    },
    [debounceCheckRpc, setSpawnData],
  );

  const handleContinue = useCallback(async () => {
    if (!userPublicKey) {
      message.error(
        'Error retrieving user public key, please ensure your master wallet key is set correctly',
      );
      return;
    }

    if (!rpc || rpcState !== RPCState.VALID) {
      message.error('Invalid RPC');
      return;
    }

    // TEMPORARY BALANCE CHECK (TO BE RESOLVED WITH MASTER WALLET CONTEXT & HOOK WHEN PUBLIC RPC IS AUTHORISED)
    const nativeBalance: number | undefined = await EthersService.getEthBalance(
      userPublicKey,
      rpc,
    ).catch(() => undefined);

    if (nativeBalance === undefined) {
      message.error('Failed to get master wallet balance');
      return;
    }

    setSpawnData((prev) => ({ ...prev, screen: nextPage, nativeBalance }));
  }, [nextPage, rpc, rpcState, setSpawnData, userPublicKey]);

  const isContinueDisabled: boolean = useMemo(
    () => !rpc || rpc.slice(0, 4) !== 'http' || rpcState !== RPCState.VALID,
    [rpc, rpcState],
  );

  const inputStatus: InputStatus = useMemo(
    () => (rpcState === RPCState.INVALID ? 'error' : ''),
    [rpcState],
  );

  const inputSuffix: ReactElement = useMemo(() => {
    switch (rpcState) {
      case RPCState.LOADING:
        return <Spin />;
      case RPCState.VALID:
        return <CheckSquareTwoTone twoToneColor="#52c41a" />;
      case RPCState.INVALID:
        return <WarningFilled color="red" />;
      default:
        return <WarningFilled color="orange" />;
    }
  }, [rpcState]);

  const items: TimelineItemProps[] = useMemo(
    () => [
      // Get nodies account
      {
        children: (
          <Flex gap={8} vertical>
            <Typography.Text>Get a Nodies account</Typography.Text>
            <Button type="primary" href={NODIES_URL} target="_blank">
              Open nodies site
            </Button>
          </Flex>
        ),
      },
      // Add application
      {
        children: (
          <Flex gap={8} vertical>
            <Typography.Text>Add application</Typography.Text>
            <Typography.Text color="grey">
              Set Gnosis as network
            </Typography.Text>
          </Flex>
        ),
      },
      // Copy endpoint
      {
        children: (
          <Flex gap={8} vertical>
            <Typography.Text>Copy endpoint</Typography.Text>
            <Typography.Text color="grey">
              Copy the endpoint from the Nodies site
            </Typography.Text>
          </Flex>
        ),
      },
      // Paste endpoint
      {
        children: (
          <Flex gap={8} vertical>
            <Typography.Text>Paste endpoint</Typography.Text>
            <Input
              value={rpc}
              placeholder={'http...'}
              onChange={handleRpcChange}
              suffix={inputSuffix}
              status={inputStatus}
            ></Input>
            <Button type="primary" onClick={handlePaste}>
              Paste
            </Button>
          </Flex>
        ),
      },
    ],
    [handlePaste, handleRpcChange, inputStatus, inputSuffix, rpc],
  );

  return (
    <Flex gap={8} vertical>
      <Typography.Text strong>Get an RPC</Typography.Text>
      <Timeline items={items} />
      <Button
        type="default"
        onClick={handleContinue}
        disabled={isContinueDisabled}
      >
        Continue
      </Button>
    </Flex>
  );
};
