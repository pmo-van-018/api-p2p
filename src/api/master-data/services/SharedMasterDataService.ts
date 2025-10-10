import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { MasterDataCommonRepository } from '@api/master-data/repositories/MasterDataCommonRepository';
import { wrap } from '@base/utils/redis-client';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { BaseMasterDataService } from '@api/master-data/services/BaseMasterDataService';
import { MasterDataLevelRepository } from '@api/master-data/repositories/MasterDataLevelRepository';

@Service()
export class SharedMasterDataService extends BaseMasterDataService {
  constructor(
    @InjectRepository() protected masterDataCommonRepository: MasterDataCommonRepository,
    @InjectRepository() public masterDataLevelRepository: MasterDataLevelRepository,
    @Logger(__filename) protected log: LoggerInterface
  ) {
    super(masterDataCommonRepository, masterDataLevelRepository, log);
  }

  public async isSupportedBank(bankName: string): Promise<boolean> {
    const supportedBanks = await this.getSupportedBanks();
    return (supportedBanks || []).some((e) => e.toLowerCase() === bankName.toLowerCase());
  }

  public async getSupportedBanks() {
    const masterDataCommon = await wrap(this.getLatestMasterDataCommonRedisKey(), () =>
      this.findLatestMasterDataCommon()
    );
    return masterDataCommon?.supportedBanks;
  }
}
