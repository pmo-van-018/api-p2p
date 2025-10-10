import { Asset } from '@api/master-data/models/Asset';
import { BLOCKCHAIN_NETWORKS } from '@api/common/models/P2PEnum';

export class AssetResponse {
  public id: string;
  public symbol: string;
  public name: string;
  public network: BLOCKCHAIN_NETWORKS;
  public logo: string;
  public precision: number;
  public orderNumber: number;
  public contract: string;
  public chainId: string;
  public rpc: string[];
  public explorerUrls: string[];

  constructor(asset: Asset & { chainId?: string; rpc?: string[]; explorerUrls?: string[] }) {
    this.id = asset.id;
    this.symbol = asset.symbol;
    this.name = asset.name;
    this.network = asset.network;
    this.logo = asset.logo;
    this.precision = asset.precision;
    this.orderNumber = asset.orderNumber;
    this.contract = asset.contract;
    this.chainId = asset.chainId;
    this.rpc = asset.rpc;
    this.explorerUrls = asset.explorerUrls;
  }
}
