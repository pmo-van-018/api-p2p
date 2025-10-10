import { SharedProfileService } from '@api/profile/services/SharedProfileService';
import { Statistic } from '@api/statistic/models/Statistic';
import { StatisticRepository } from '@api/statistic/repositories/StatisticRepository';
import { orderSumData } from '@api/statistic/types/Volume';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { OrderStatisticUtil } from '@base/utils/orderStatistic';
import moment from 'moment';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { BaseStatisticService } from '@api/statistic/services/BaseStatisticService';

@Service()
export class StatisticService extends BaseStatisticService {
  constructor(
    protected sharedProfileService: SharedProfileService,
    @InjectRepository() protected statisticRepository: StatisticRepository,
    @Logger(__filename) protected log: LoggerInterface
  ) {
    super(sharedProfileService, statisticRepository, log);
  }

  public async updateUserTotalStatistic(userId: string, orderData: orderSumData) {
    this.log.debug(
      `Start implement updateUserTotalStatistic for user ${userId} with data ${JSON.stringify(orderData)}`
    );
    await this.getOrCreateStatisticByUserId(userId);
    const statistic = OrderStatisticUtil.getTotalStatistic(orderData);
    await this.statisticRepository.updateStatisticWithOperatorOrUser({
      userId,
      statistic,
      lastCountAt: moment().utc().toDate(),
    });
    this.log.debug(`Stop implement updateUserTotalStatistic for user ${userId} with data ${JSON.stringify(orderData)}`);
  }

  public async updateOperationTotalStatistic(operationId: string, orderData: orderSumData) {
    this.log.debug(
      `Start implement updateOperationTotalStatistic for operation ${operationId} with data ${JSON.stringify(
        orderData
      )}`
    );
    const statistic = await this.getOrCreateStatisticByOperationId(operationId);
    // tslint:disable-next-line:max-line-length
    const averageCompletedTime = (statistic.averageCompletedTime * statistic.orderCompletedCount + orderData.totalLifecycleCompletedTime) / (statistic.orderCompletedCount + orderData.totalSuccessOrder);
    // tslint:disable-next-line:max-line-length
    const averageCancelledTime = (statistic.averageCancelledTime * statistic.cancelOrderCount + orderData.totalLifecycleCancelledTime) / (statistic.totalOrderCount - statistic.orderCompletedCount + orderData.totalOrderCancelled);
    const newStatistic = OrderStatisticUtil.getTotalStatistic({...orderData, averageCancelledTime, averageCompletedTime });
    await this.statisticRepository.updateStatisticWithOperatorOrUser({
      operationId,
      statistic: newStatistic,
      lastCountAt: moment().utc().toDate(),
    });
    this.log.debug(
      `Stop implement updateOperationTotalStatistic for operation ${operationId} with data ${JSON.stringify(orderData)}`
    );
  }

  public async resetMonthStatistic() {
    this.log.debug(`Start implement resetMonthStatistic`);
    await this.statisticRepository.update(
      {},
      {
        monthOrderCompletedCount: 0,
        monthOrderCount: 0,
      }
    );
    this.log.debug(`Stop implement resetMonthStatistic`);
  }

  public async countAllOperator(merchantManagerId?: string): Promise<Statistic> {
    return await this.statisticRepository.countAllOperator(merchantManagerId);
  }
}
