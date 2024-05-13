import { ContractInterface, ethers, providers, utils } from 'ethers';

import { gnosisProvider } from '@/constants/providers';
import { Address } from '@/types';

/**
 * Returns native balance of the given address
 * @param address
 * @param rpc
 * @returns Promise<number>
 */
const getEthBalance = async (
  address: Address,
  rpc: string,
): Promise<number> => {
  try {
    const provider = new providers.StaticJsonRpcProvider(rpc, {
      name: 'Gnosis',
      chainId: 100, // we currently only support Gnosis Trader agent
    });
    return provider.getBalance(address).then((balance) => {
      const formattedBalance = utils.formatEther(balance);
      return Number(formattedBalance);
    });
  } catch (e) {
    return Promise.reject('Failed to get ETH balance');
  }
};

/**
 * Returns the ERC20 balance of the given address
 * @param address Address
 * @param rpc string
 * @param contractAddress Address
 * @returns Promise<number>
 */
const getErc20Balance = async (
  address: Address,
  rpc: string,
  contractAddress?: Address,
): Promise<number> => {
  try {
    if (!contractAddress)
      throw new Error('Contract address is required for ERC20 balance');
    const provider = new providers.StaticJsonRpcProvider(rpc, {
      name: 'Gnosis',
      chainId: 100, // we currently only support Gnosis Trader agent
    });
    const contract = new ethers.Contract(
      contractAddress,
      [
        'function balanceOf(address) view returns (uint256)',
        'function decimals() view returns (uint8)',
      ],
      provider,
    );
    const [balance, decimals] = await Promise.all([
      contract.balanceOf(address),
      contract.decimals(),
    ]);
    if (!balance || !decimals)
      throw new Error('Failed to resolve balance or decimals');
    return Number(utils.formatUnits(balance, decimals));
  } catch (e) {
    return Promise.reject(e);
  }
};

/**
 * Checks if the given RPC is valid
 * @param rpc string
 * @returns Promise<boolean>
 */
const checkRpc = async (rpc: string): Promise<boolean> => {
  try {
    if (!rpc) throw new Error('RPC is required');

    const provider = new providers.StaticJsonRpcProvider(rpc, {
      name: 'Gnosis',
      chainId: 100, // we currently only support Gnosis Trader agent
    });

    const networkId = (await provider.getNetwork()).chainId;
    if (!networkId) throw new Error('Failed to get network ID');

    return Promise.resolve(true);
  } catch (e) {
    return Promise.resolve(false);
  }
};

const readContract = ({
  address,
  abi,
}: {
  address: string;
  abi: ContractInterface;
}) => {
  const contract = new ethers.Contract(address, abi, gnosisProvider);
  return contract;
};

export const EthersService = {
  getEthBalance,
  getErc20Balance,
  checkRpc,
  readContract,
};
