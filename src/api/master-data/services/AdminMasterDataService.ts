import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { MasterDataCommonRepository } from '@api/master-data/repositories/MasterDataCommonRepository';
import { MasterDataLevelRepository } from '@api/master-data/repositories/MasterDataLevelRepository';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { BaseMasterDataService } from '@api/master-data/services/BaseMasterDataService';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { MasterDataCommon } from '@api/master-data/models/MasterDataCommon';
import { MIN_MERCHANT_LEVEL } from '@api/common/models/P2PConstant';
import { deleteCache } from '@base/utils/redis-client';

@Service()
export class AdminMasterDataService extends BaseMasterDataService {
  constructor(
    @InjectRepository() protected readonly masterDataCommonRepository: MasterDataCommonRepository,
    @InjectRepository() protected readonly masterDataLevelRepository: MasterDataLevelRepository,
    @Logger(__filename) protected log: LoggerInterface
  ) {
    super(masterDataCommonRepository, masterDataLevelRepository, log);
  }
  public async updateMasterDataCommon (existMasterDataCommon: MasterDataCommon, partialEntity: QueryDeepPartialEntity<MasterDataCommon>) {
    const masterDataCommon = this.masterDataCommonRepository.merge(
      existMasterDataCommon ? existMasterDataCommon : this.masterDataCommonRepository.create(),
      partialEntity as any
    );
    return await this.masterDataCommonRepository.save(masterDataCommon);
  }

  // tslint:disable-next-line:typedef
  public async updateFeeByLevel(fee: number, level = MIN_MERCHANT_LEVEL) {
    this.log.debug('Start storeFeeToMasterDataLevel ', fee);
    const masterDataLevel = await this.masterDataLevelRepository.findOneOrFail({
      merchantLevel: level,
    });
    masterDataLevel.fee = fee;
    await masterDataLevel.save();
    this.log.debug('Stop storeFeeToMasterDataLevel ', fee);
  }

  public async removeMasterDataCache() {
    await deleteCache(this.getLatestMasterDataLevelRedisKey(MIN_MERCHANT_LEVEL));
    await deleteCache(this.getLatestMasterDataCommonRedisKey());
  }
}
