import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { FindAllMerchantsInWhitelistQueryRequest } from '@api/profile/requests/FindAllMerchantsQueryRequest';
import { Helper } from '@api/infrastructure/helpers/Helper';
import { OperationStatus, OperationType } from '@api/common/models';
import { AdminProfileService } from '@api/profile/services/AdminProfileService';
import { SharedStatisticService } from '@api/statistic/services/SharedStatisticService';

@Service()
export class GetListManagerUseCase {
  constructor(
    private adminProfileService: AdminProfileService,
    private sharedStatisticService: SharedStatisticService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getManagers(query: FindAllMerchantsInWhitelistQueryRequest) {
    this.log.debug(`Start implement getManagers: ${JSON.stringify(query)}`);
    const status = query.status
      ? (Helper.normalizeStringToArray(query.status, ',') as unknown as OperationStatus[])
      : [OperationStatus.ACTIVE, OperationStatus.INACTIVE];
    const results = await this.adminProfileService.findAllMerchants({
      ...query,
      status,
      types: OperationType.MERCHANT_MANAGER,
    });
    if (results.items.length) {
      const managerIds = results.items.map((e) => e.id);
      const statistics = await this.sharedStatisticService.getOrderAverageTimeByManagerIds(managerIds);
      results.items = this.adminProfileService.setOperationStatistic(results.items, statistics);
    }
    this.log.debug(`Stop implement getManagers: ${JSON.stringify(query)}`);
    return results;
  }
}
