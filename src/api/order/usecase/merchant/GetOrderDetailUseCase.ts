import {Logger, LoggerInterface} from '@base/decorators/Logger';
import {Service} from 'typedi';
import {OrderLifeCycleError} from '@api/order/errors/OrderLifeCycleError';
import {OperationType, TradeType} from '@api/common/models';
import {Operation} from '@api/profile/models/Operation';
import {MerchantOrderLifecycleService} from '@api/order/services/order/MerchantOrderLifecycleService';

@Service()
export class GetOrderDetailUseCase {
  constructor(
    private merchantOrderService: MerchantOrderLifecycleService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getOrderDetail(currentUser: Operation, orderRefId: string, type: TradeType) {
    this.log.debug('Start implement getOrderDetail method for: ', currentUser.type, currentUser.walletAddress);
    const order = await this.merchantOrderService.getOrderInfo(currentUser, orderRefId, currentUser.type === OperationType.MERCHANT_MANAGER);
    const merchantManagerId = currentUser.type === OperationType.MERCHANT_MANAGER ? currentUser.id : currentUser.merchantManagerId;
    if (!order || order.merchant.merchantManagerId !== merchantManagerId) {
      return OrderLifeCycleError.ORDER_NOT_FOUND;
    }
    if (order.type !== type) {
      return OrderLifeCycleError.ORDER_TYPE_IS_INVALID;
    }
    this.log.debug('Stop implement getOrderDetail method for: ', currentUser.type, currentUser.walletAddress);
    return order;
  }
}
