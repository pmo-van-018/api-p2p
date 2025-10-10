export const CHAIN_ENVIRONMENT = {
  MAINNET: 'MAINNET',
  TESTNET: 'TESTNET',
};

export const CHAIN = {
  VCHAIN: 'VCHAIN',
  BSC: 'BSC',
  POLYGON: 'POLYGON',
  TRON: 'TRON',
  KDONG: 'KDONG',
};

export const TOKEN = {
  BSC: 'BSC',
  USDT: 'USDT',
  KDG: 'KDG',
};

export const CHAIN_ID = {
  [CHAIN_ENVIRONMENT.MAINNET]: {
    [CHAIN.BSC]: 56,
    [CHAIN.POLYGON]: 137,
    [CHAIN.TRON]: 728126428, // 0x2b6653dc
    [CHAIN.KDONG]: 12000, // 0x2ee0
  },
  [CHAIN_ENVIRONMENT.TESTNET]: {
    [CHAIN.BSC]: 97,
    [CHAIN.POLYGON]: 80001,
    [CHAIN.TRON]: 3448148188, // 0xcd8690dc,
    [CHAIN.KDONG]: 12000, // 0x2ee0
  },
};

export const CHAIN_RPC = {
  [CHAIN_ENVIRONMENT.MAINNET]: {
    [CHAIN.BSC]: ['https://bsc-dataseed1.binance.org', 'https://bsc-pokt.nodies.app'],
    [CHAIN.POLYGON]: ['https://polygon-rpc.com', 'https://polygon.drpc.org'],
    [CHAIN.TRON]: ['https://api.trongrid.io'],
    [CHAIN.KDONG]: ['https://rpc.kdong.io'],
  },
  [CHAIN_ENVIRONMENT.TESTNET]: {
    [CHAIN.BSC]: ['https://bsc-testnet-rpc.publicnode.com', 'https://data-seed-prebsc-1-s1.bnbchain.org:8545'],
    [CHAIN.POLYGON]: ['https://polygon-mumbai-pokt.nodies.app', 'https://polygon-mumbai-bor-rpc.publicnode.com'],
    [CHAIN.TRON]: ['https://nile.trongrid.io'],
    [CHAIN.KDONG]: ['https://rpc.kdong.io'],
  },
};

export const EXPLORER_CHAIN_URL = {
  [CHAIN_ENVIRONMENT.MAINNET]: {
    [CHAIN.BSC]: ['https://bscscan.com'],
    [CHAIN.POLYGON]: ['https://polygonscan.com'],
    [CHAIN.TRON]: ['https://tronscan.org'],
    [CHAIN.KDONG]: ['https://scan.kdong.io'],
  },
  [CHAIN_ENVIRONMENT.TESTNET]: {
    [CHAIN.BSC]: ['https://testnet.bscscan.com'],
    [CHAIN.POLYGON]: ['https://mumbai.polygonscan.com'],
    [CHAIN.TRON]: ['https://nile.tronscan.org'],
    [CHAIN.KDONG]: ['https://scan.kdong.io'],
  },
};

// https://chainid.network/chains.json
// https://chainid.network/chains_mini.json
// https://github.com/DefiLlama/chainlist
// https://github.com/ethereum-lists/chains
export const CHAIN_DATA_URL = (chain: number) =>
  `https://raw.githubusercontent.com/ethereum-lists/chains/master/_data/chains/eip155-${chain}.json`;

export const CONTRACTS = {
  [CHAIN_ENVIRONMENT.MAINNET]: {
    [CHAIN.BSC]: {
      [TOKEN.USDT]: '0x55d398326f99059fF775485246999027B3197955',
    },
    [CHAIN.POLYGON]: {
      [TOKEN.USDT]: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    },
    [CHAIN.TRON]: {
      [TOKEN.USDT]: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    },
    [CHAIN.KDONG]: {
      [TOKEN.KDG]: '',
    }
  },
  [CHAIN_ENVIRONMENT.TESTNET]: {
    [CHAIN.BSC]: {
      [TOKEN.USDT]: '0x110F1586329D01b6C12F30588C6F8EECa93132f2',
    },
    [CHAIN.POLYGON]: {
      [TOKEN.USDT]: '0xfba42CEE3b7B37f6497A2B0440db47381322C092',
    },
    [CHAIN.TRON]: {
      [TOKEN.USDT]: 'TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj',
    },
    [CHAIN.KDONG]: {
      [TOKEN.KDG]: '',
    }
  },
};

export const isTronChain = (chainId: number) =>
  chainId === CHAIN_ID[CHAIN_ENVIRONMENT.MAINNET][CHAIN.TRON] ||
  chainId === CHAIN_ID[CHAIN_ENVIRONMENT.TESTNET][CHAIN.TRON];
