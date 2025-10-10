import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Operation } from '@api/profile/models/Operation';
import { SharedResourceService } from '@api/master-data/services/SharedResourceService';
import { BalanceConfigurationService } from '@api/profile/services/BalanceConfigurationService';
import { CreateNewBalanceConfigRequest } from '@api/profile/requests/Merchants/CreateNewBalanceConfigRequest';
import { HttpResponseError } from '@api/common/errors';
import { plainToInstance } from 'class-transformer';
import { BalanceConfiguration } from '@api/profile/models/BalanceConfiguration';
import { BalanceConfigurationData } from '@api/notification/types/Notification';
import { events } from '@api/subscribers/events';
import { BalanceConfigError } from '@api/profile/errors/BalanceConfigError';
import { SharedProfileService } from '@api/profile/services/SharedProfileService';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';

@Service()
export class SetBalanceConfigUseCase {
  constructor(
    private sharedResourceService: SharedResourceService,
    private sharedOperationService: SharedProfileService,
    private balanceConfigService: BalanceConfigurationService,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async setBalanceConfiguration(data: CreateNewBalanceConfigRequest, currentUser: Operation) {
    this.log.debug(`Start implement setBalanceConfiguration with managerId: ${currentUser.id}`);
    const manager = await this.sharedOperationService.findManagerById(currentUser.id);
    if (!manager) {
      return HttpResponseError.FORBIDDEN_ERROR;
    }

    const assetIds = data.balanceConfigs.map((balanceConfig) => balanceConfig.assetId);
    const assets = await this.sharedResourceService.getEnableAssets();
    if (assets.length !== assetIds.length) {
      return BalanceConfigError.ASSET_IS_INVALID;
    }
    const balanceConfigs = await this.balanceConfigService.getManagerBalanceConfig(currentUser.id);
    const balanceConfigInstances = data.balanceConfigs.map((balanceConfig) => {
      return plainToInstance(BalanceConfiguration, { ...balanceConfig, managerId: currentUser.id });
    });
    await this.balanceConfigService.upsertManagerBalanceConfig(balanceConfigInstances);
    const balanceConfigurationData: BalanceConfigurationData[] = data.balanceConfigs.map((balanceConfig) => {
      return {
        assetId: balanceConfig.assetId,
        balance: balanceConfig.balance,
        oldBalance: Number(balanceConfigs.find((config) => config.assetId === balanceConfig.assetId)?.balance || 0),
      };
    });
    this.eventDispatcher.dispatch(events.actions.balanceConfig.updateBalanceConfig, {
      balanceConfigs: balanceConfigurationData,
      managerId: currentUser.id,
    });
    this.log.debug(`Stop implement setBalanceConfiguration with managerId: ${currentUser.id}`);
    return null;
  }
}
