import { AssetResponse } from './AssetResponse';
import { FiatResponse } from './FiatResponse';
import { Asset } from '@api/master-data/models/Asset';
import { Fiat } from '@api/master-data/models/Fiat';

export class ResourceResponse {
  public assets?: AssetResponse[];
  public fiats?: FiatResponse[];
  public allAssets?: AssetResponse[];
  public metadata: any;

  constructor(resource: { assets?: Asset[]; fiats?: Fiat[]; allAssets?: Asset[]; metadata: any }) {
    this.assets = (resource.assets || []).map((asset) => new AssetResponse(asset));
    this.fiats = (resource.fiats || []).map((fiat) => new FiatResponse(fiat));
    this.allAssets = (resource.allAssets || []).map((asset) => new AssetResponse(asset));
    this.metadata = resource.metadata || {};
  }
}
