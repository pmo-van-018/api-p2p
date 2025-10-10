import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Operation } from '@api/profile/models/Operation';
import { SharedResourceService } from '@api/master-data/services/SharedResourceService';
import { BalanceConfigurationService } from '@api/profile/services/BalanceConfigurationService';

@Service()
export class GetBalanceConfigurationUseCase {
  constructor(
    private sharedResourceService: SharedResourceService,
    private balanceConfigService: BalanceConfigurationService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getManagerBalanceConfig(currentUser: Operation) {
    this.log.debug(`Start implement getBalanceConfigurationByManagerId with managerId: ${currentUser.id}`);
    const assets = await this.sharedResourceService.getEnableAssets();
    if (!assets?.length) {
      return [];
    }
    const balanceConfigs = await this.balanceConfigService.getManagerBalanceConfigWithAssets(
      currentUser.id,
      assets.map((asset) => asset.id)
    );
    this.log.debug(`Stop implement getBalanceConfigurationByManagerId with managerId: ${currentUser.id}`);
    return balanceConfigs;
  }
}
