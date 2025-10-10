import { Service } from 'typedi';
import { ResourceService } from '@api/master-data/services/ResourceService';
import { BaseMasterDataService } from '@api/master-data/services/BaseMasterDataService';
import { env } from '@base/env';

@Service()
export class GetResourceUseCase {
  constructor(private resourceService: ResourceService, private masterDataService: BaseMasterDataService) {}

  public async getResource() {
    const [rawAssets, fiats] = await this.resourceService.getResource();

    const allAssets = rawAssets.map((asset) => {
      const chain = asset.network.toLowerCase();
      return {
        ...asset,
        chainId: env.chainId[chain],
        rpc: env.rpc[chain],
        explorerUrls: env.explorerUrls[chain],
      };
    });

    // update filter by data common
    const masterData = await this.masterDataService.getLatestMasterDataCommon();
    const assets = allAssets.filter((asset) => {
      return masterData?.assetNetworkTypes.some((item) => item === `${asset.name} (${asset.network})`);
    });

    return {
      assets,
      fiats,
      allAssets,
      metadata: masterData.metadata,
    };
  }
}
