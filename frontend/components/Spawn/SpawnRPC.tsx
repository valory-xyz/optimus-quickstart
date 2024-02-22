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
import {
  Dispatch,
  ReactElement,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { useSpawn, useEthers, useAppInfo } from '@/hooks';
import { SpawnScreenState } from '@/enums';
import { CheckSquareTwoTone, WarningFilled } from '@ant-design/icons';
import { InputStatus } from 'antd/es/_util/statusUtils';
import { debounce } from 'lodash';

enum RPCState {
  LOADING,
  VALID,
  INVALID,
}

type SpawnRPCProps = {
  rpc: string;
  setRpc: Dispatch<SetStateAction<string>>;
  nextPage: SpawnScreenState;
};

export const SpawnRPC = ({ rpc, setRpc, nextPage }: SpawnRPCProps) => {
  const { setSpawnScreenState } = useSpawn();
  const { checkRPC, getEthBalance } = useEthers();
  const { userPublicKey } = useAppInfo();

  const [isCheckingRpc, setIsCheckingRpc] = useState(false);
  const [rpcState, setRpcState] = useState<RPCState>(RPCState.INVALID);

  const handlePaste = useCallback(
    async (): Promise<void> =>
      navigator.clipboard
        .readText()
        .then((text) => setRpc(text))
        .catch(() => {
          message.error('Failed to read clipboard');
        }),
    [setRpc],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceCheckRpc = useCallback(
    debounce((_rpc: string) => {
      if (isCheckingRpc) return;
      if (!_rpc) return;
      setIsCheckingRpc(true);
      checkRPC(_rpc)
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
      setRpc(e.target.value);
      setRpcState(RPCState.LOADING);
      debounceCheckRpc(e.target.value);
    },
    [debounceCheckRpc, setRpc],
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

    const ethBalance: number | undefined = await getEthBalance(
      userPublicKey,
      rpc,
    ).catch(() => undefined);

    if (ethBalance === undefined) {
      message.error('Failed to get master wallet balance');
      return;
    }

    if (ethBalance < 1) {
      message.error(
        `Insufficient master wallet balance, you need at least 1 XDAI. ${userPublicKey}`,
      );
      return;
    }

    setSpawnScreenState(nextPage);
  }, [
    getEthBalance,
    nextPage,
    rpc,
    rpcState,
    setSpawnScreenState,
    userPublicKey,
  ]);

  const isContinueDisabled: boolean = useMemo(
    () => !rpc || rpcState !== RPCState.VALID,
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
              placeholder={'https://...'}
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
