module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: Number(process.env.CHAIN_ID) || 100,
    },
  },
};
