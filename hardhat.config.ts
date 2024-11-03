import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY!;
const config: HardhatUserConfig = {
  defaultNetwork: "baseSepolia",
  paths: {
    sources: "./contracts",
    tests: "./test",
    artifacts: "./build/artifacts",
    cache: "./build/cache",
  },
  solidity: {
    compilers: [
      {
        version: "0.8.27",
        settings: {
          optimizer: {
            enabled: true,
            runs: 0,
          },
        },
      },
    ],
  },
  networks: {
    baseMainnet: {
      url: `https://base-mainnet.infura.io/v3/${process.env.INFURA_KEY!}`,
      chainId: 8453,
      gasPrice: 5e7,
      accounts: [
        `0x${PRIVATE_KEY}`,
      ],
    },
    baseSepolia: {
      url: `https://base-sepolia.infura.io/v3/${process.env.INFURA_KEY!}`,
      chainId: 84532,
      gasPrice: 4e8,
      accounts: [
        `0x${PRIVATE_KEY}`,
      ],
    },
    cchainFuji: {
      url: `https://avalanche-fuji.infura.io/v3/${process.env.INFURA_KEY!}`,
      chainId: 43113,
      gasPrice: 3e10,
      accounts: [
        `0x${PRIVATE_KEY}`,
      ]
    },
    arbSepolia: {
      url: `https://arbitrum-sepolia.infura.io/v3/${process.env.INFURA_KEY}`,
      chainId: 421614,
      gasPrice: 2e8,
      accounts: [
        `0x${PRIVATE_KEY}`,
      ]
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_KEY}`,
      chainId: 11155111,
      gas: 3e9,
      accounts: [
        `0x${PRIVATE_KEY}`,
      ]
    }
  }
};

export default config;
