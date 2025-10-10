import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import { UserOrderLifecycleService } from '@api/order/services/order/UserOrderLifecycleService';
import { Order } from '@api/order/models/Order';
import { Operation } from '@api/profile/models/Operation';
import { PaginationResult } from '@api/common/types';
import { PaginationQueryRequest } from '@api/common/requests/PaginationQueryRequest';
import { SharedPaymentMethodService } from '@api/payment/services/SharedPaymentMethodService';

@Service()
export class ListTransactionFailedUseCase {
  constructor(
    private userOrderService: UserOrderLifecycleService,
    private sharedPaymentMethodService: SharedPaymentMethodService,
    @Logger(__filename) private log: LoggerInterface
  ) {}
  
  public async getList(currentUser: Operation, request: PaginationQueryRequest): Promise<Promise<PaginationResult<Order>>>{
    this.log.debug('Start implement ListTransactionFailedUseCase getList for: ', currentUser.type, currentUser.walletAddress);
    const [orders, total] = await this.userOrderService.getListTransactionFailed(request);
    if (orders.length) {
      const paymentMethodIds = orders.map((order) => order.paymentMethodId);
      const paymentMethods = await this.sharedPaymentMethodService.getPaymentMethodByIds(paymentMethodIds);
      orders.forEach((order) => {
        const paymentMethod = paymentMethods.find((pm) => pm.id === order.paymentMethodId);
        if (paymentMethod) {
          order.paymentMethod = paymentMethod;
        }
      })
    }
    this.log.debug('End implement ListTransactionFailedUseCase getList for: ', currentUser.type, currentUser.walletAddress);
    return  {
      items: orders,
      totalItems: total,
    };
  }
}
