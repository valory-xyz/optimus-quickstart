export const CHAINS: {
  [chain: string]: {
    currency: string;
    chainId: number;
    minimumFunding: number;
  };
} = {
  gnosis: { currency: 'XDAI', chainId: 100, minimumFunding: 1 },
};
