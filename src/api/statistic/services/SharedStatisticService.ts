import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { StatisticRepository } from '@api/statistic/repositories/StatisticRepository';
import { BUY_ORDER_STEPS, Order, SELL_ORDER_STEP } from '@api/order/models/Order';
import { OperationType, UserType } from '@api/common/models/P2PEnum';
import { OrderStatisticUtil } from '@base/utils/orderStatistic';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { BaseStatisticService } from '@api/statistic/services/BaseStatisticService';
import { SharedProfileService } from '@api/profile/services/SharedProfileService';

@Service()
export class SharedStatisticService extends BaseStatisticService {
  constructor(
    protected sharedProfileService: SharedProfileService,
    @InjectRepository() protected statisticRepository: StatisticRepository,
    @Logger(__filename) protected log: LoggerInterface
  ) {
    super(sharedProfileService, statisticRepository, log);
  }

  public async getUserStatistic(userId: string) {
    return await this.statisticRepository.findOne({ userId });
  }

  public async getMerchantStatistic(operationId: string) {
    return await this.statisticRepository.findOne({ operationId });
  }

  public async createByUserId(userId: string): Promise<string> {
    return (await this.statisticRepository.insert({ userId })).identifiers[0]['id'];
  }

  public async createByOperationId(operationId: string): Promise<string> {
    return (await this.statisticRepository.insert({ operationId })).identifiers[0]['id'];
  }

  public async updateOrderStatistic(order: Order, toOrderStep: BUY_ORDER_STEPS | SELL_ORDER_STEP) {
    this.log.debug('Start implement updateOrderStatistic method for: ', order.id, toOrderStep);
    await this.updateOperationStatistic(order, order.merchantId, toOrderStep);
    await this.updateUserStatistic(order, order.userId, toOrderStep);
    this.log.debug(`Stop implement updateOrderStatistic for order ${order.id}`);
  }

  public async updateUserStatistic(
    order: Order,
    userId: string,
    toOrderStep: BUY_ORDER_STEPS | SELL_ORDER_STEP
  ) {
    this.log.debug('Start implement updateUserStatistic method for: ', order.id, toOrderStep);
    await this.getOrCreateStatisticByUserId(userId);
    const statistic = OrderStatisticUtil.getProcessStatistic(UserType.USER, order, toOrderStep);
    await this.statisticRepository.updateStatisticWithOperatorOrUser({userId, statistic});
    this.log.debug(`Stop implement updateUserStatistic for user ${userId}`);
  }

  public async updateOperationStatistic(
    order: Order,
    operationId: string,
    toOrderStep: BUY_ORDER_STEPS | SELL_ORDER_STEP
  ) {
    this.log.debug('Start implement updateOperationStatistic method for: ', order.id, toOrderStep);
    await this.getOrCreateStatisticByOperationId(operationId);
    const statistic = OrderStatisticUtil.getProcessStatistic(OperationType.MERCHANT_OPERATOR, order, toOrderStep);
    await this.statisticRepository.updateStatisticWithOperatorOrUser({operationId, statistic});
    this.log.debug(`Stop implement updateOperationStatistic for operation ${operationId}`);
  }

  // tslint:disable-next-line:typedef
  public async updatePostCount(operationId: string, postWillOnline: boolean, amount = 1) {
    await this.statisticRepository.updateStatisticWithOperatorOrUser(
      {
        operationId,
        statistic: {
          postHideCount: { operator: postWillOnline ? '-' : '+', count: amount },
          postShownCount: { operator: postWillOnline ? '+' : '-', count: amount },
        },
      }
    );
  }

  // tslint:disable-next-line:typedef
  public async increaseShowPost(operationId: string, count = 1) {
    this.log.debug(`Start implement increaseShowPost for operation ${operationId}`);
    await this.statisticRepository.increment(
      {
        operationId,
      },
      'postShownCount',
      count
    );
    this.log.debug(`Stop implement increaseShowPost for operation ${operationId}`);
  }

  public async increaseHidePost(operationId: string) {
    this.log.debug(`Start implement increaseHidePost for operation ${operationId}`);
    await this.statisticRepository.increment(
      {
        operationId,
      },
      'postHideCount',
      1
    );
    this.log.debug(`Stop implement increaseHidePost for operation ${operationId}`);
  }

  public async decrementShownPost(operationId: string) {
    this.log.debug(`Start implement decrementShownPost for operation ${operationId}`);
    await this.statisticRepository.increment(
      {
        operationId,
      },
      'postShownCount',
      1
    );
    this.log.debug(`Stop implement decrementShownPost for operation ${operationId}`);
  }

  public getOrderAverageTimeByManagerIds(managerIds: string[]) {
    return this.statisticRepository.getOrderAverageTimeByManagerIds(managerIds);
  }
}
