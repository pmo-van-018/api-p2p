import { Service } from 'typedi';
import { StatisticService } from '@api/statistic/services/StatisticService';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Operation } from '@api/profile/models/Operation';
import { OperationType } from '@api/common/models';
import { Statistic } from '@api/statistic/models/Statistic';

@Service()
export class GetMerchantBriefStatisticUseCase {
  constructor(
    private statisticService: StatisticService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getBriefStatistic(currentUser: Operation) {
    this.log.debug(`Start implement getBriefStatistic: ${currentUser.id}`);
    let statistic: Statistic;
    if (currentUser.type === OperationType.MERCHANT_MANAGER) {
      statistic = await this.statisticService.getMerchantManagerStatistic(currentUser.id);
    } else {
      statistic = await this.statisticService.getMerchantStatistic(currentUser.id);
    }

    this.log.debug(`Stop implement getBriefStatistic: ${currentUser.id}`);
    return statistic;
  }
}
