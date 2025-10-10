import { Service } from 'typedi';
import { BalanceConfigurationRepository } from '../repositories/BalanceConfigurationRepository';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { BalanceConfiguration } from '../models/BalanceConfiguration';
import { In } from 'typeorm';

@Service()
export class BalanceConfigurationService {
  constructor(
    @InjectRepository() private balanceConfigurationRepository: BalanceConfigurationRepository
  ) {}

  public async getBalanceConfigurationByAssetId(managerId: string, assetId: string) {
    return await this.balanceConfigurationRepository.findOne({
      managerId,
      assetId,
    });
  }

  public async getManagerBalanceConfigWithAssets(managerId: string, assetIds: string[]) {
    return await this.balanceConfigurationRepository.find({
      managerId,
      assetId: In(assetIds),
    });
  }

  public async getManagerBalanceConfig(managerId: string) {
    return await this.balanceConfigurationRepository.find({
      managerId,
    });
  }

  public async upsertManagerBalanceConfig(balanceConfigs: BalanceConfiguration[]) {
    await this.balanceConfigurationRepository.upsert(balanceConfigs, {
      conflictPaths: ['assetId', 'managerId'],
      skipUpdateIfNoValuesChanged: true,
    });
  }
}
