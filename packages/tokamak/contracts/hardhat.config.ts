import path from 'path'

import { HardhatUserConfig } from 'hardhat/types'
import { subtask } from 'hardhat/config'
import { TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD } from 'hardhat/builtin-tasks/task-names'
import 'solidity-coverage'
import * as dotenv from 'dotenv'
import { ethers } from 'ethers'

// Hardhat plugins
import '@eth-optimism/hardhat-deploy-config'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-etherscan'
import '@primitivefi/hardhat-dodoc'
import '@typechain/hardhat'
import 'hardhat-deploy'
import 'hardhat-gas-reporter'
import 'hardhat-output-validator'

// Hardhat tasks
import './tasks'

// Load environment variables from .env
dotenv.config()

subtask(
  TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD,
  async (
    args: {
      quiet: boolean
      solcVersion: string
    },
    hre,
    runSuper
  ) => {
    if (args.solcVersion === '0.5.17') {
      const compilerPath = path.join(
        __dirname,
        'soljson-v0.5.17+commit.d19bba13.js'
      )
      console.log('Use customize solc')
      return {
        compilerPath,
        isSolcJs: true,
        version: args.solcVersion,
        longVersion: '0.5.17+commit.d19bba13',
      }
    }

    // we just use the default subtask if the version is not 0.8.5
    return runSuper()
  }
)

const enableGasReport = !!process.env.ENABLE_GAS_REPORT
const privateKey = process.env.PRIVATE_KEY || '0x' + '11'.repeat(32)
// this is to avoid hardhat error
const deploy = process.env.DEPLOY_DIRECTORY || 'deploy'

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      live: false,
      saveDeployments: false,
      tags: ['local'],
    },
    'hardhat-remote': {
      chainId: 31337,
      url: process.env.CONTRACTS_RPC_URL || '',
      deploy,
      accounts: [privateKey],
    },
    mainnet: {
      chainId: 1,
      url: process.env.CONTRACTS_RPC_URL || '',
      deploy,
      accounts: [privateKey],
    },
    titan: {
      chainId: 55004,
      url: 'https://rpc.titan.tokamak.network',
    },
    holesky: {
      chainId: 17000,
      url: process.env.CONTRACTS_RPC_URL || '',
      deploy,
      accounts: [privateKey],
    },
    sepolia: {
      chainId: 11155111,
      url: process.env.CONTRACTS_RPC_URL || '',
      deploy,
      accounts: [privateKey],
    },
    'titond-demo': {
      chainId: 11155111,
      url: process.env.CONTRACTS_RPC_URL || '',
      deploy,
      accounts: [privateKey],
    },
  },
  mocha: {
    timeout: 50000,
  },
  solidity: {
    compilers: [
      {
        version: '0.8.9',
        settings: {
          optimizer: { enabled: true, runs: 10_000 },
        },
      },
      {
        version: '0.5.17', // Required for WETH9
        settings: {
          optimizer: { enabled: true, runs: 10_000 },
        },
      },
    ],
    settings: {
      metadata: {
        bytecodeHash: 'none',
      },
      outputSelection: {
        '*': {
          '*': ['metadata', 'storageLayout'],
        },
      },
    },
  },
  typechain: {
    outDir: 'dist/types',
    target: 'ethers-v5',
  },
  paths: {
    deploy: './deploy',
    deployments: './deployments',
    deployConfig: './deploy-config',
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  gasReporter: {
    enabled: enableGasReport,
    currency: 'USD',
    gasPrice: 100,
    outputFile: process.env.CI ? 'gas-report.txt' : undefined,
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY || '',
      goerli: process.env.ETHERSCAN_API_KEY || '',
      sepolia: process.env.ETHERSCAN_API_KEY || '',
      holesky: process.env.ETHERSCAN_API_KEY || '',
      titan: 'verify',
    },
    customChains: [
      {
        network: 'titan',
        chainId: 55004,
        urls: {
          apiURL: 'https://explorer.titan.tokamak.network/api',
          browserURL: 'https://explorer.titan.tokamak.network',
        },
      },
      {
        network: 'holesky',
        chainId: 17000,
        urls: {
          apiURL: 'https://api-holesky.etherscan.io/api',
          browserURL: 'https://holesky.etherscan.io',
        },
      },
    ],
  },
  dodoc: {
    runOnCompile: true,
    exclude: [
      'Helper_GasMeasurer',
      'Helper_SimpleProxy',
      'TestERC20',
      'TestLib_CrossDomainUtils',
      'TestLib_OVMCodec',
      'TestLib_RLPReader',
      'TestLib_RLPWriter',
      'TestLib_AddressAliasHelper',
      'TestLib_MerkleTrie',
      'TestLib_SecureMerkleTrie',
      'TestLib_Buffer',
      'TestLib_Bytes32Utils',
      'TestLib_BytesUtils',
      'TestLib_MerkleTree',
    ],
  },
  outputValidator: {
    runOnCompile: true,
    errorMode: false,
    checks: {
      events: false,
      variables: false,
    },
    exclude: ['contracts/test-helpers', 'contracts/test-libraries'],
  },
  deployConfigSpec: {
    isForkedNetwork: {
      type: 'boolean',
      default: false,
    },
    numDeployConfirmations: {
      type: 'number',
      default: 0,
    },
    gasPrice: {
      type: 'number',
      default: undefined,
    },
    l1BlockTimeSeconds: {
      type: 'number',
    },
    l2BlockGasLimit: {
      type: 'number',
    },
    l2ChainId: {
      type: 'number',
    },
    ctcL2GasDiscountDivisor: {
      type: 'number',
    },
    ctcEnqueueGasCost: {
      type: 'number',
    },
    sccFaultProofWindowSeconds: {
      type: 'number',
    },
    sccSequencerPublishWindowSeconds: {
      type: 'number',
    },
    ovmSequencerAddress: {
      type: 'address',
    },
    ovmProposerAddress: {
      type: 'address',
    },
    ovmBlockSignerAddress: {
      type: 'address',
    },
    ovmFeeWalletAddress: {
      type: 'address',
    },
    ovmAddressManagerOwner: {
      type: 'address',
    },
    ovmGasPriceOracleOwner: {
      type: 'address',
    },
    ovmWhitelistOwner: {
      type: 'address',
      default: ethers.constants.AddressZero,
    },
    gasPriceOracleOverhead: {
      type: 'number',
      default: 2750,
    },
    gasPriceOracleScalar: {
      type: 'number',
      default: 1_500_000,
    },
    gasPriceOracleDecimals: {
      type: 'number',
      default: 6,
    },
    gasPriceOracleL1BaseFee: {
      type: 'number',
      default: 1,
    },
    gasPriceOracleL2GasPrice: {
      type: 'number',
      default: 1,
    },
    hfBerlinBlock: {
      type: 'number',
      default: 0,
    },
  },
}

if (
  process.env.CONTRACTS_TARGET_NETWORK &&
  process.env.CONTRACTS_DEPLOYER_KEY &&
  process.env.CONTRACTS_RPC_URL &&
  config.networks
) {
  config.networks[process.env.CONTRACTS_TARGET_NETWORK] = {
    accounts: [process.env.CONTRACTS_DEPLOYER_KEY],
    url: process.env.CONTRACTS_RPC_URL,
    live: true,
    saveDeployments: true,
    tags: [process.env.CONTRACTS_TARGET_NETWORK],
  }
}

export default config
