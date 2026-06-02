require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const RPC_URL = process.env.RPC_URL || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

const networks = {
  hardhat: {},
  localhost: { url: "http://127.0.0.1:8545" }
};

if (PRIVATE_KEY && RPC_URL) {
  networks.sepolia = { url: RPC_URL, accounts: [PRIVATE_KEY] };
  networks.polygonAmoy = { url: RPC_URL, accounts: [PRIVATE_KEY] };
  networks.baseSepolia = { url: RPC_URL, accounts: [PRIVATE_KEY] };
}

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: { optimizer: { enabled: true, runs: 200 } }
  },
  networks,
  etherscan: { apiKey: ETHERSCAN_API_KEY }
};
