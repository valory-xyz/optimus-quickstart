import { MULTICALL_CONTRACT } from '@/constants';
import { BigNumber, ethers } from 'ethers';
import { Contract, ContractCall, Provider } from 'ethers-multicall';
import { multicall3Abi } from '@/abi';
import { Address } from '@/types';

export const useMulticall = () => {
  /**
   * Gets ETH balances for a list of addresses
   * @param addresses
   * @param rpc
   * @returns Promise<{ [address: string]: number }>
   */
  const getEthBalances = async (
    addresses: Address[],
    rpc: string,
  ): Promise<{ [address: Address]: number }> => {
    const provider = new ethers.providers.JsonRpcProvider(rpc);
    const multicallProvider = new Provider(provider, 100);
    const multicallContract = new Contract(MULTICALL_CONTRACT, multicall3Abi);

    const callData: ContractCall[] = addresses.map((address: Address) =>
      multicallContract.getEthBalance(address),
    );

    return multicallProvider.all(callData).then((r: BigNumber[]) =>
      r.reduce(
        (
          acc: { [address: Address]: number },
          balance: BigNumber,
          index: number,
        ) => ({
          ...acc,
          [addresses[index]]: parseFloat(ethers.utils.formatEther(balance)),
        }),
        {},
      ),
    );
  };

  /**
   * Gets ERC20 balances for a list of addresses
   * @param addresses
   * @param rpc
   * @param contractAddress
   * @returns Promise<{ [address: string]: number }>
   */
  const getErc20Balances = async (
    addresses: Address[],
    rpc: string,
    contractAddress: Address,
  ) => {
    const provider = new ethers.providers.JsonRpcProvider(rpc);
    const multicallProvider = new Provider(provider, 100); // hardcoded to 100
    const multicallContract = new Contract(MULTICALL_CONTRACT, multicall3Abi);

    const callData: ContractCall[] = addresses.map((address: Address) =>
      multicallContract.call(contractAddress, 'balanceOf(address):(uint256)', [
        address,
      ]),
    );

    return multicallProvider.all(callData).then((r: BigNumber[]) =>
      r.reduce(
        (
          acc: { [address: Address]: number },
          balance: BigNumber,
          index: number,
        ) => ({
          ...acc,
          [addresses[index]]: parseFloat(ethers.utils.formatUnits(balance, 18)), // consider multicall for decimals here
        }),
        {},
      ),
    );
  };

  return { getEthBalances, getErc20Balances };
};
