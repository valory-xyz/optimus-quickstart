const dotenv = require("dotenv");

dotenv.config();

/**@type import('hardhat/config').HardhatUserConfig */
const config = {
  networks: {
    hardhat: {
      forking: {
        url: process.env.FORK_URL,    
      },
      chainId: 100
    },
  },  
};

module.exports = config