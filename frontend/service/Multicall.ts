import { BigNumber, ethers } from 'ethers';
import { Contract as MulticallContract, ContractCall } from 'ethers-multicall';

import { MULTICALL3_ABI } from '@/abi';
import { ERC20_BALANCEOF_FRAGMENT } from '@/abi/erc20';
import { MULTICALL_CONTRACT_ADDRESS } from '@/constants';
import { gnosisMulticallProvider } from '@/constants/providers';
import { Address, AddressNumberRecord } from '@/types';

const multicallContract = new MulticallContract(
  MULTICALL_CONTRACT_ADDRESS,
  MULTICALL3_ABI,
);

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

  await gnosisMulticallProvider.init();
  const multicallResponse = await gnosisMulticallProvider.all(callData);

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
    new MulticallContract(contractAddress, ERC20_BALANCEOF_FRAGMENT).balanceOf(
      address,
    ),
  );

  await gnosisMulticallProvider.init();

  const multicallResponse = await gnosisMulticallProvider.all(callData);

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
