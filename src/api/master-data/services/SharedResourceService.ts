import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { AssetRepository } from '@api/master-data/repositories/AssetRepository';
import { FiatRepository } from '@api/master-data/repositories/FiatRepository';
import { Asset } from '@api/master-data/models/Asset';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { SharedMasterDataService } from '@api/master-data/services/SharedMasterDataService';
import { BaseResourceService } from '@api/master-data/services/BaseResourceService';

@Service()
export class SharedResourceService extends BaseResourceService {
  constructor(
    @InjectRepository() protected fiatRepository: FiatRepository,
    @InjectRepository() protected assetRepository: AssetRepository,
    private masterDataService: SharedMasterDataService,
    @Logger(__filename) protected log: LoggerInterface
  ) {
    super(assetRepository, assetRepository, log);
  }

  public async getEnableAssets(): Promise<Asset[]> {
    try {
      const allAssets = await this.assetRepository.find();
      const masterData = await this.masterDataService.getLatestMasterDataCommon();
      return allAssets.filter((asset) => {
        return masterData?.assetNetworkTypes.some((item) => item === `${asset.name} (${asset.network})`);
      });
    } catch (error: any) {
      this.log.error(error.message);
    }
    return null;
  }
}
