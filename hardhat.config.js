// temporary during development
require("dotenv").config();
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      forking: {url: ""},
      chainId: 100,
      port: process.env.PORT || 8545,      
    },
  },
  
};
