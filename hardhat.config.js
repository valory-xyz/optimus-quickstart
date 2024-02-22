// temporary during development
require("dotenv").config();
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      hostname: "0.0.0.0",
      forking: {url: process.env.FORK_URL},
      chainId: 100,
      port: process.env.PORT || 8545,      
    },
  },  
};
