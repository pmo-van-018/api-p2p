import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import { User } from '@api/profile/models/User';
import { UserOrderLifecycleService } from '@api/order/services/order/UserOrderLifecycleService';
import { UserGetListOrderRequest } from '@api/order/requests/UserGetListOrderRequest';
import { DateFormat } from '@api/infrastructure/helpers/DateFormat';
import { Helper } from '@api/infrastructure/helpers/Helper';
import { OrderStatus } from '@api/order/models/Order';

@Service()
export class GetListOrderUseCase {
  constructor(
    private userOrderService: UserOrderLifecycleService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getOrders(currentUser: User, query: UserGetListOrderRequest) {
    this.log.debug('Start implement GetListOrderUseCase method for: ', currentUser.type, currentUser.walletAddress);
    const statusArr = query.status ? Helper.normalizeStringToArray(query.status, ',') : [];
    const [items, totalItems] = await this.userOrderService.getOrders({
      ...query,
      status: statusArr,
      startDate: DateFormat.formatStartDate(query.startDate),
      endDate: DateFormat.formatEndDate(query.endDate),
      userId: currentUser.id,
      sort: Helper.normalizeStringToSortObjectArray(query.sort, 'ASC'),
      hasAppeal: statusArr.includes(OrderStatus.CANCELLED.toString())
    });
    this.log.debug('Stop implement GetListOrderUseCase method for: ', currentUser.type, currentUser.walletAddress);
    return { items, totalItems };
  }
}
