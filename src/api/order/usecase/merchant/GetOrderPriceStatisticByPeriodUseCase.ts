import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import { Operation } from '@api/profile/models/Operation';
import { MerchantOrderManagementService } from '@api/order/services/order/MerchantOrderManagementService';
import { GetOrderPriceStatisticByPeriodRequest } from '@api/order/requests/GetOrderPriceStatisticByPeriodRequest';

@Service()
export class GetOrderPriceStatisticByPeriodUseCase {
  constructor(
    private merchantOrderManagementService: MerchantOrderManagementService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getOrderPriceStatistic(currentUser: Operation, filter: GetOrderPriceStatisticByPeriodRequest) {
    this.log.debug('Start implement GetOrderPriceStatisticByPeriodUseCase method for: ', currentUser.type, currentUser.walletAddress);
    const {from, to, type } = filter;
    const orders =  await this.merchantOrderManagementService.getOrderPriceStatisticByPeriod(from, to, type, currentUser.id);
    this.log.debug('Stop implement GetOrderPriceStatisticByPeriodUseCase method for: ', currentUser.type, currentUser.walletAddress);
    return orders;
  }
}
