import { BLOCKCHAIN_NETWORKS, nativeTokenNetwork } from '@api/common/models/P2PEnum';
import { Asset } from '@api/master-data/models/Asset';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { env } from '@base/env';
import { ethers, providers } from 'ethers';
import TronWeb from 'tronweb';
import { Service } from 'typedi';
import { getTronBalance } from './TronService';

@Service()
export class SharedBlockchainTransactionService {
  protected providerFactory = new Map<BLOCKCHAIN_NETWORKS, Map<string, providers.JsonRpcProvider>>();
  protected tronWeb: TronWeb;
  constructor(@Logger(__filename) private log: LoggerInterface) {
    this.initJsonRpcProvider();
    this.tronWeb = new TronWeb({
      fullHost: env.tronlink.fullHost,
      privateKey: env.tronlink.privateKey,
      solidityNode: env.tronlink.fullHost,
    });
  }

  public async getBalanceByAsset(address: string, asset: Asset): Promise<number> {
    const { network, contract } = asset;
    this.log.debug(
      `Start implement getBalanceByAsset with address: ${address}, network: ${network}, contractAddress: ${contract} `
    );
    let balance = 0;
    try {
      if (nativeTokenNetwork[network]) {
        return this.getNativeTokenBalance(address, asset);
      }

      if (ethers.utils.isAddress(address)) {
        const rpcs: any[] = env.rpc[String(network).toLowerCase()];

        if (!rpcs?.length) {
          return balance;
        }

        const rpc = rpcs[0];
        const decimal = await this.getDecimal(network, contract, rpc);
        const balanceEth = await this.getBalanceOf(network, contract, rpc, address);
        balance = parseFloat(ethers.utils.formatUnits(balanceEth, decimal));
      } else {
        const tronBalance = await getTronBalance(this.tronWeb, address, contract);
        balance = parseFloat(tronBalance);
      }
      this.log.debug(
        `Stop implement getBalanceByAsset with address: ${address}, network: ${network}, contractAddress: ${contract} `
      );
      return balance;
    } catch (error: any) {
      this.log.error('[getBalanceByAsset] Fail to import get balance', error);
      return balance;
    }
  }

  private async getNativeTokenBalance(address: string, asset: Asset): Promise<number> {
    const { network } = asset;
    if (ethers.utils.isAddress(address)) {
      const nativeToken = nativeTokenNetwork[network];
      const rpcs: any[] = env.rpc[String(network).toLowerCase()];

      if (!rpcs?.length) {
        return 0;
      }

      const rpc = rpcs[0];
      const provider = this.getOrCreateProvider(network, rpc);
      const balance = await provider.getBalance(address);
      return parseFloat(ethers.utils.formatUnits(balance, nativeToken.precision));
    } else {
      // Is not EVM network, return 0
      return 0;
    }
  }

  private async getDecimal(network: BLOCKCHAIN_NETWORKS, contractAddress: string, rpc: string) {
    const provider = this.getOrCreateProvider(network, rpc);
    const contract = new ethers.Contract(contractAddress, ['function decimals() view returns (uint8)'], provider);
    return await contract.decimals();
  }

  private async getBalanceOf(
    network: BLOCKCHAIN_NETWORKS,
    contractAddress: string,
    rpc: string,
    address: string
  ): Promise<number> {
    const provider = this.getOrCreateProvider(network, rpc);
    const contract = new ethers.Contract(
      contractAddress,
      ['function balanceOf(address owner) view returns (uint256)'],
      provider
    );
    return await contract.balanceOf(address);
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
