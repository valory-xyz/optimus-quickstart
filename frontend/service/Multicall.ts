import { multicall3Abi } from '@/abi';
import { MULTICALL_CONTRACT } from '@/constants';
import { AddressNumberRecord } from '@/types';
import { Address } from '@/types';
import { ethers, BigNumber } from 'ethers';
import { Provider, Contract, ContractCall } from 'ethers-multicall';

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
  const provider = new ethers.providers.JsonRpcProvider(rpc, {
    chainId: 100,
    name: 'Gnosis',
  }); // hardcode gnosis chainId
  const multicallProvider = new Provider(provider, 100); // hardcode gnosis chainId
  const multicallContract = new Contract(MULTICALL_CONTRACT, multicall3Abi);

  const callData: ContractCall[] = addresses.map((address: Address) =>
    multicallContract.getEthBalance(ethers.utils.getAddress(address)),
  );

  return multicallProvider.all(callData).then((responseData: BigNumber[]) =>
    responseData.reduce(
      (acc: AddressNumberRecord, balance: BigNumber, index: number) => ({
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
 * @returns Promise<AddressNumberRecord>
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
      (acc: AddressNumberRecord, balance: BigNumber, index: number) => ({
        ...acc,
        [addresses[index]]: parseFloat(ethers.utils.formatUnits(balance, 18)), // consider multicall for decimals here
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
