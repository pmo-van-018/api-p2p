import { BLOCKCHAIN_NETWORKS } from '@api/common/models/P2PEnum';
import { Asset } from '@api/master-data/models/Asset';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Spanning } from '@base/decorators/Tracing';
import { env } from '@base/env';
import { ethers, providers, utils } from 'ethers';
import { Service } from 'typedi';
import { getTronTransaction } from './TronService';

@Service()
export class BlockchainTransactionService {
  protected providerFactory = new Map<BLOCKCHAIN_NETWORKS, Map<string, providers.JsonRpcProvider>>();

  constructor(@Logger(__filename) private log: LoggerInterface) {
    this.initJsonRpcProvider();
  }

  @Spanning()
  public async getTransactionReceipt(hash: string, network: BLOCKCHAIN_NETWORKS, rpc: string) {
    try {
      const isHex: boolean = utils.isHexString(hash);
      if (!isHex) {
        return null;
      }
      const provider = this.getOrCreateProvider(network, rpc);
      return await provider.getTransactionReceipt(hash);
    } catch (error: any) {
      this.log.error('Fail to get transaction receipt', error);
      throw error;
    }
  }

  public async getTransactionReceiptStatus(
    txnHash: string,
    rpc: string,
    network: BLOCKCHAIN_NETWORKS
  ): Promise<number> {
    try {
      const transactionReceipt =
        network === BLOCKCHAIN_NETWORKS.TRON
          ? await getTronTransaction(txnHash)
          : await this.getOrCreateProvider(network, rpc).getTransactionReceipt(txnHash);
      return transactionReceipt?.status;
    } catch (error: any) {
      this.log.error('getTransactionReceiptStatus method fail', error);
      throw error;
    }
  }

  public async isNativeToken(hash: string, network: BLOCKCHAIN_NETWORKS, rpc: string) {
    try {
      const provider = this.getOrCreateProvider(network, rpc);
      const tx = await provider.getTransaction(hash);
      if (!tx) { return false; }
      return tx.data === '0x' && tx.value.gt(0);
    } catch (error: any) {
      this.log.error('isNativeToken method fail', error);
      throw error;
    }
  }

  public async getTransactionCreatedAt(hash: string, network: BLOCKCHAIN_NETWORKS, rpc: string) {
    try {
      const provider = this.getOrCreateProvider(network, rpc);
      const tx = await provider.getTransaction(hash);
      const createdAt = (await provider.getBlock(tx?.blockNumber))?.timestamp;
      if (!createdAt) {
        return null;
      }
      return new Date(createdAt * 1000).toUTCString();
    } catch (error: any) {
      this.log.error('getTransactionCreatedAt method fail', error);
      throw error;
    }
  }

  public getTransactionTransferLogs(logs: any) {
    try {
      const ABI = ['event Transfer(address indexed from, address indexed to, uint256 value)'];
      const ifaceEther = new ethers.utils.Interface(ABI);
      if (!Array.isArray(logs)) {
        return null;
      }
      return logs
        .map((log) => {
          try {
            return ifaceEther.parseLog(log);
          } catch (error) {
            return null;
          }
        })
        .filter((log) => log && log.name === 'Transfer');
    } catch (error: any) {
      this.log.error('Fail to get transaction logs', error);
      throw error;
    }
  }

  public async getDecimal(asset: Asset, rpc: string) {
    try {
      const provider = this.getOrCreateProvider(asset.network, rpc);
      const contract = new ethers.Contract(
        asset.contract,
        [
          // Read-Only Functions
          'function balanceOf(address owner) view returns (uint256)',
          'function decimals() view returns (uint8)',
          'function symbol() view returns (string)',

          // Authenticated Functions
          'function transfer(address to, uint amount) returns (bool)',

          // Events
          'event Transfer(address indexed from, address indexed to, uint amount)',
        ],
        provider
      );
      return await contract.decimals();
    } catch (error: any) {
      this.log.error('getDecimal method fail', error);
      throw error;
    }
  }

  public convertWeiToUnit(wei: string, decimals: number) {
    return utils.formatUnits(wei, decimals).toString();
  }

  private getOrCreateProvider(network: BLOCKCHAIN_NETWORKS, rpcUrl: string): providers.JsonRpcProvider {
    if (!this.providerFactory.has(network) || !this.providerFactory.get(network).has(rpcUrl)) {
      this.providerFactory
        .get(network)
        .set(rpcUrl, new providers.JsonRpcProvider({ url: rpcUrl, timeout: env.rpcTimeout }));
    }
    return this.providerFactory.get(network).get(rpcUrl);
  }

  private initJsonRpcProvider(): void {
    Object.values(BLOCKCHAIN_NETWORKS).forEach((value) => {
      const rpcsByChain: string[] = env.rpc[String(value).toLowerCase()];

      if (!rpcsByChain) {
        return;
      }

      const providerByChain = new Map<string, providers.JsonRpcProvider>();
      rpcsByChain.reduce((providerMap, url) => {
        providerMap.set(url, new providers.JsonRpcProvider({ url, timeout: env.rpcTimeout }));
        return providerMap;
      }, providerByChain);
      this.providerFactory.set(value, providerByChain);
    });
  }
}
