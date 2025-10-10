import { OptionValues } from 'commander';
import fetch from 'node-fetch';
import { Connection } from 'typeorm';

import {
  CHAIN,
  CHAIN_DATA_URL,
  CHAIN_ID,
  CHAIN_RPC,
  CONTRACTS,
  EXPLORER_CHAIN_URL,
  isTronChain,
  TOKEN,
} from './api/constant/chain';
import { env } from './env';
import { createConnection } from './loaders/typeormLoader';

export class TokenChain {
  private config = {
    ignoreError: false,
    loadRemote: false,
    overwriteContract: false,
    chainEnv: env.chainEnv,
  };

  private data = {
    contracts: {
      [CHAIN.BSC]: {
        [TOKEN.USDT]: CONTRACTS[this.config.chainEnv][CHAIN.BSC][TOKEN.USDT],
      },
      [CHAIN.POLYGON]: {
        [TOKEN.USDT]: CONTRACTS[this.config.chainEnv][CHAIN.POLYGON][TOKEN.USDT],
      },
      [CHAIN.TRON]: {
        [TOKEN.USDT]: CONTRACTS[this.config.chainEnv][CHAIN.TRON][TOKEN.USDT],
      },
      [CHAIN.KDONG]: {
        [TOKEN.KDG]: CONTRACTS[this.config.chainEnv][CHAIN.KDONG][TOKEN.KDG],
      },
    },
    rpcs: {
      [CHAIN.BSC]: CHAIN_RPC[this.config.chainEnv][CHAIN.BSC],
      [CHAIN.POLYGON]: CHAIN_RPC[this.config.chainEnv][CHAIN.POLYGON],
      [CHAIN.TRON]: CHAIN_RPC[this.config.chainEnv][CHAIN.TRON],
      [CHAIN.KDONG]: CHAIN_RPC[this.config.chainEnv][CHAIN.KDONG],
    },
    explorerUrls: {
      [CHAIN.BSC]: EXPLORER_CHAIN_URL[this.config.chainEnv][CHAIN.BSC],
      [CHAIN.POLYGON]: EXPLORER_CHAIN_URL[this.config.chainEnv][CHAIN.POLYGON],
      [CHAIN.TRON]: EXPLORER_CHAIN_URL[this.config.chainEnv][CHAIN.TRON],
      [CHAIN.KDONG]: EXPLORER_CHAIN_URL[this.config.chainEnv][CHAIN.KDONG],
    },
  };

  constructor(config?: { overwriteContract?: boolean }) {
    this.config.overwriteContract = !!config?.overwriteContract ?? this.config.overwriteContract;
    this.setEnvFromDefaultChains();
  }

  public loadCommandLineOptions(options: OptionValues): TokenChain {
    this.config = {
      ...this.config,
      ignoreError: options.ignoreError || this.config.ignoreError,
      loadRemote: options.loadRemote || this.config.loadRemote,
      chainEnv: options.chainEnv?.toUpperCase() || this.config.chainEnv,
      overwriteContract:
        options.chainEnv || options.usdtBscContract || options.usdtPolygonContract || options.usdtTronContract
          ? true
          : options.overwriteContract || this.config.overwriteContract,
    };

    this.data = {
      ...this.data,
      contracts: {
        ...this.data.contracts,
        [CHAIN.BSC]: {
          [TOKEN.USDT]: options.usdtBscContract || CONTRACTS[this.config.chainEnv][CHAIN.BSC][TOKEN.USDT],
        },
        [CHAIN.POLYGON]: {
          [TOKEN.USDT]: options.usdtPolygonContract || CONTRACTS[this.config.chainEnv][CHAIN.POLYGON][TOKEN.USDT],
        },
        [CHAIN.TRON]: {
          [TOKEN.USDT]: options.usdtTronContract || CONTRACTS[this.config.chainEnv][CHAIN.TRON][TOKEN.USDT],
        },
        [CHAIN.KDONG]: {
          [TOKEN.KDG]: options.kdgKdongContract || CONTRACTS[this.config.chainEnv][CHAIN.KDONG][TOKEN.KDG],
        },
      },
      rpcs: {
        [CHAIN.BSC]:
          options.rpcBscUrl?.split(',') ||
          CHAIN_RPC[this.config.chainEnv][CHAIN.BSC] ||
          env.rpc[CHAIN.BSC.toLowerCase()],
        [CHAIN.POLYGON]:
          options.rpcPolygonUrl?.split(',') ||
          CHAIN_RPC[this.config.chainEnv][CHAIN.POLYGON] ||
          env.rpc[CHAIN.POLYGON.toLowerCase()],
        [CHAIN.TRON]:
          options.rpcTronUrl?.split(',') ||
          CHAIN_RPC[this.config.chainEnv][CHAIN.TRON] ||
          env.rpc[CHAIN.TRON.toLowerCase()],
        [CHAIN.KDONG]:
          options.rpcKdongUrl?.split(',') ||
          CHAIN_RPC[this.config.chainEnv][CHAIN.KDONG] ||
          env.rpc[CHAIN.KDONG.toLowerCase()],
      },
      explorerUrls: {
        [CHAIN.BSC]:
          options.explorerBscUrl?.split(',') ||
          EXPLORER_CHAIN_URL[this.config.chainEnv][CHAIN.BSC] ||
          env.explorerUrls[CHAIN.BSC.toLowerCase()],
        [CHAIN.POLYGON]:
          options.explorerPolygonUrl?.split(',') ||
          EXPLORER_CHAIN_URL[this.config.chainEnv][CHAIN.POLYGON] ||
          env.explorerUrls[CHAIN.POLYGON.toLowerCase()],
        [CHAIN.TRON]:
          options.explorerTronUrl?.split(',') ||
          EXPLORER_CHAIN_URL[this.config.chainEnv][CHAIN.TRON] ||
          env.explorerUrls[CHAIN.TRON.toLowerCase()],
        [CHAIN.KDONG]:
          options.explorerKdongUrl?.split(',') ||
          EXPLORER_CHAIN_URL[this.config.chainEnv][CHAIN.KDONG] ||
          env.explorerUrls[CHAIN.KDONG.toLowerCase()],
      },
    };

    this.setEnvFromCLI();

    return this;
  }

  public async setup(): Promise<void> {
    const connection = await createConnection();
    try {
      // Update rpc for each chain in application and database
      let logChains = {};
      await Promise.all(
        Object.keys(this.data.contracts).map(async (c) => {
          const chain = c.toLowerCase();
          const tokens = this.data.contracts[chain.toUpperCase()];

          if (this.config.overwriteContract) {
            await Promise.all(
              Object.keys(tokens).map(async (token) => {
                await this.updateContractToken(connection, tokens[token], token, chain);
              })
            );
          }

          this.updateChainEnv({ chain });

          logChains = {
            ...logChains,
            [chain]: {
              chain: chain.toUpperCase(),
              chainId: CHAIN_ID[this.config.chainEnv][chain.toUpperCase()],
              contracts: tokens,
              // rpc: env.rpc[chain],
            },
          };
        })
      );

      if (this.config.loadRemote) {
        await this.fetchingChainsRemote();
      }

      console.info('>>> INFO CHAIN <<<');
      console.info(logChains);
    } finally {
      await connection.close();
    }
  }

  private async fetchingChainsRemote() {
    let chainsData = [];
    try {
      const chainsResp = await Promise.all(
        Object.values(CHAIN_ID[this.config.chainEnv])
          .filter((chainId) => !isTronChain(chainId))
          .map(async (chainId) => await fetch(CHAIN_DATA_URL(chainId)))
      );
      chainsData = await Promise.all(chainsResp.map(async (d) => await d.json()));
    } catch (error) {
      if (this.config.ignoreError) {
        console.info('[WARN] Can not fetch chains from remote');
        return;
      }
      throw error;
    }

    for (const c of chainsData) {
      const chain = c.chain.toLowerCase();

      if (!env.rpc[chain]) {
        console.info('[WARN] Can not find chain in enviroment: ', chain);
        return;
      }

      this.updateChainEnv({
        chain,
        rpcUrls: c.rpc.filter((url: string) => !url.includes('API_KEY') && !url.includes('wss://')),
        explorerUrls: c.explorers.map((explorer: any) => explorer.url),
      });
    }
  }

  private async updateContractToken(
    connection: Connection,
    contract: string,
    name: string,
    network: string
  ): Promise<void> {
    await connection.query(`UPDATE assets SET contract = ? WHERE UPPER(name) = ? AND UPPER(network) = ?`, [
      contract,
      name,
      network.toUpperCase(),
    ]);
  }

  private updateChainEnv(options: { chain: string; rpcUrls?: string[]; explorerUrls?: string[] }): void {
    const { chain, rpcUrls, explorerUrls } = options;

    if (rpcUrls && rpcUrls.length) {
      env.rpc[chain.toLowerCase()] = [...env.rpc[chain.toLowerCase()], ...rpcUrls];
    }

    if (explorerUrls && explorerUrls.length) {
      env.explorerUrls[chain.toLowerCase()] = [...env.explorerUrls[chain.toLowerCase()], ...explorerUrls];
    }
  }

  private setEnvFromDefaultChains() {
    Object.keys(this.data.contracts).map(async (c) => {
      if (env.rpc[c.toLowerCase()] && !env.rpc[c.toLowerCase()].length) {
        env.rpc[c.toLowerCase()] = [...this.data.rpcs[c]];
      }
      if (env.explorerUrls[c.toLowerCase()] && !env.explorerUrls[c.toLowerCase()].length) {
        env.explorerUrls[c.toLowerCase()] = [...this.data.explorerUrls[c]];
      }
    });
  }

  private setEnvFromCLI() {
    env.chainEnv = this.config.chainEnv;

    Object.keys(this.data.contracts).map(async (c) => {
      if (env.chainId[c.toLowerCase()]) {
        env.chainId[c.toLowerCase()] = CHAIN_ID[this.config.chainEnv][c.toUpperCase()];
      }

      if (env.rpc[c.toLowerCase()]) {
        env.rpc[c.toLowerCase()] = [...this.data.rpcs[c]];
      }

      if (env.explorerUrls[c.toLowerCase()]) {
        env.explorerUrls[c.toLowerCase()] = [...this.data.explorerUrls[c]];
      }
    });
  }
}
