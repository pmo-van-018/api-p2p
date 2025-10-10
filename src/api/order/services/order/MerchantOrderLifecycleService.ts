import {Service} from 'typedi';
import {Order} from '@api/order/models/Order';
import {Operation} from '@api/profile/models/Operation';
import {BaseOrderLifecycleService} from '@api/order/services/order/BaseOrderLifecycleService';
import {InjectRepository} from 'typeorm-typedi-extensions';
import {OrderRepository} from '@api/order/repositories/OrderRepository';
import {Logger, LoggerInterface} from '@base/decorators/Logger';

@Service()
export class MerchantOrderLifecycleService extends BaseOrderLifecycleService {
  constructor(
    @InjectRepository() protected orderRepository: OrderRepository,
    @Logger(__filename) protected log: LoggerInterface
  ) {
    super(orderRepository, log);
  }

  public async getOrderInfo(currentUser: Operation, orderId: string, viewOnly?: boolean): Promise<Order> {
    return await this.orderRepository.getOneById({
      id: orderId,
      user: currentUser,
      viewOnly,
      searchByRefId: true,
    });
  }
}
