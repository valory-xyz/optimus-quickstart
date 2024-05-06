import { ethers } from 'ethers';
import { Provider } from 'ethers-multicall';

export const gnosisProvider = new ethers.providers.StaticJsonRpcProvider(
  process.env.GNOSIS_RPC,
);

export const gnosisMulticallProvider = new Provider(gnosisProvider, 100);
