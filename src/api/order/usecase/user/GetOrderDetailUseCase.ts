import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import { User } from '@api/profile/models/User';
import { OrderLifeCycleError } from '@api/order/errors/OrderLifeCycleError';
import { TradeType } from '@api/common/models';
import { UserOrderLifecycleService } from '@api/order/services/order/UserOrderLifecycleService';

@Service()
export class GetOrderDetailUseCase {
  constructor(
    private userOrderService: UserOrderLifecycleService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getOrderDetail(currentUser: User, orderRefId: string, type: TradeType) {
    this.log.debug('Start implement getOrderDetail method for: ', currentUser.type, currentUser.walletAddress);
    const order = await this.userOrderService.getFullInfoByRefId(orderRefId);
    if (!order || order.userId !== currentUser.id) {
      return OrderLifeCycleError.ORDER_NOT_FOUND;
    }
    if (order.type !== type) {
      return OrderLifeCycleError.ORDER_TYPE_IS_INVALID;
    }
    this.log.debug('Stop implement getOrderDetail method for: ', currentUser.type, currentUser.walletAddress);
    return order;
  }
}
