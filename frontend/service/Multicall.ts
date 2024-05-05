import { BigNumber, ethers } from 'ethers';
import { Contract, ContractCall, Provider } from 'ethers-multicall';

import { multicall3Abi } from '@/abi';
import { ERC20_BALANCEOF_FRAGMENT } from '@/abi/erc20Abi';
import { MULTICALL_CONTRACT } from '@/constants';
import { Address, AddressNumberRecord } from '@/types';

const provider = new ethers.providers.StaticJsonRpcProvider(
  process.env.GNOSIS_RPC,
);
const multicallProvider = new Provider(provider, 100);

const multicallContract = new Contract(MULTICALL_CONTRACT, multicall3Abi);

/**
 * Gets ETH balances for a list of addresses
 * @param addresses
 * @param rpc
 * @returns Promise<AddressNumberRecord>
 */
const getEthBalances = async (
  addresses: Address[],
): Promise<AddressNumberRecord> => {
  if (!addresses.length) return {};

  const callData: ContractCall[] = addresses.map((address: Address) =>
    multicallContract.getEthBalance(address),
  );

  if (!callData.length) return {};

  await multicallProvider.init();
  const multicallResponse = await multicallProvider.all(callData);

  return multicallResponse.reduce(
    (acc: AddressNumberRecord, balance: BigNumber, index: number) => ({
      ...acc,
      [addresses[index]]: parseFloat(ethers.utils.formatUnits(balance, 18)),
    }),
    {},
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
  contractAddress: Address,
): Promise<AddressNumberRecord> => {
  if (!contractAddress) return {};
  if (!addresses.length) return {};

  const callData: ContractCall[] = addresses.map((address: Address) =>
    new Contract(contractAddress, ERC20_BALANCEOF_FRAGMENT).balanceOf(address),
  );

  await multicallProvider.init();

  const multicallResponse = await multicallProvider.all(callData);

  return multicallResponse.reduce(
    (acc: AddressNumberRecord, balance: BigNumber, index: number) => ({
      ...acc,
      [addresses[index]]: parseFloat(ethers.utils.formatUnits(balance, 18)),
    }),
    {},
  );
};

const MulticallService = {
  getEthBalances,
  getErc20Balances,
};

export default MulticallService;
