import { BigNumber, ethers } from 'ethers';
import { Contract, ContractCall, Provider } from 'ethers-multicall';

import { multicall3Abi } from '@/abi';
import { ERC20_BALANCEOF_FRAGMENT } from '@/abi/erc20Abi';
import { MULTICALL_CONTRACT } from '@/constants';
import { Address, AddressNumberRecord } from '@/types';

/**
 * Gets ETH balances for a list of addresses
 * @param addresses
 * @param rpc
 * @returns Promise<AddressNumberRecord>
 */
const getEthBalances = async (
  addresses: Address[],
  rpc: string,
): Promise<AddressNumberRecord> => {
  const provider = new ethers.providers.StaticJsonRpcProvider(rpc);

  // hardcode gnosis chainId
  const multicallProvider = new Provider(provider, 100);
  const multicallContract = new Contract(MULTICALL_CONTRACT, multicall3Abi);

  const callData: ContractCall[] = addresses.map((address: Address) =>
    multicallContract.getEthBalance(address),
  );

  const multicallResponse = await multicallProvider
    .all(callData)
    .then((responseData: BigNumber[]) =>
      responseData.reduce(
        (acc: AddressNumberRecord, balance: BigNumber, index: number) => ({
          ...acc,
          [addresses[index]]: parseFloat(ethers.utils.formatEther(balance)),
        }),
        {},
      ),
    );

  return multicallResponse;
};

/**
 * Gets ERC20 balances for a list of addresses
 * @param addresses
 * @param rpc
 * @param contractAddress
 * @returns Promise<AddressNumberRecord>
 */
const getErc20Balances = async (
  addresses: Address[],
  rpc: string,
  contractAddress: Address,
): Promise<AddressNumberRecord> => {
  const provider = new ethers.providers.StaticJsonRpcProvider(rpc);
  const multicallProvider = new Provider(provider, 100); // hardcoded to 100

  const callData: ContractCall[] = addresses.map((address: Address) =>
    new Contract(contractAddress, ERC20_BALANCEOF_FRAGMENT).balanceOf(address),
  );

  return multicallProvider.all(callData).then((r: BigNumber[]) =>
    r.reduce(
      (acc: AddressNumberRecord, balance: BigNumber, index: number) => ({
        ...acc,
        [addresses[index]]: parseFloat(ethers.utils.formatUnits(balance, 18)),
      }),
      {},
    ),
  );
};

const MulticallService = {
  getEthBalances,
  getErc20Balances,
};

export default MulticallService;
