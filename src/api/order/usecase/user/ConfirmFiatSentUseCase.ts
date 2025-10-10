import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import { User } from '@api/profile/models/User';
import { OrderLifeCycleError } from '@api/order/errors/OrderLifeCycleError';
import { UserOrderLifecycleService } from '@api/order/services/order/UserOrderLifecycleService';
import { BUY_ORDER_STEPS, Order, OrderStatus } from '@api/order/models/Order';
import { sendSystemNotification } from '@base/utils/chat-notification.utils';
import { events } from '@api/subscribers/events';
import { IsolationLevel, Transactional } from 'typeorm-transactional-cls-hooked';
import moment from 'moment';
import { SharedStatisticService } from '@api/statistic/services/SharedStatisticService';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { SharedMasterDataService } from '@api/master-data/services/SharedMasterDataService';

@Service()
export class ConfirmFiatSentUseCase {
  constructor(
    private userOrderService: UserOrderLifecycleService,
    private sharedStatisticService: SharedStatisticService,
    private sharedMasterDataService: SharedMasterDataService,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async confirmSent(currentUser: User, orderRefId: string) {
    this.log.debug('Start implement ConfirmFiatSentUseCase: ', orderRefId);
    const order = await this.userOrderService.getFullInfoByRefId(orderRefId);
    if (!order || order.userId !== currentUser.id) {
      return OrderLifeCycleError.ORDER_NOT_FOUND;
    }
    if (order.isStatusNotEqual(OrderStatus.TO_BE_PAID)) {
      return OrderLifeCycleError.ORDER_STATUS_IS_INVALID;
    }
    if (order.isUserPaymentExpired()) {
      return OrderLifeCycleError.FIAT_PAYMENT_TIME_IS_EXPIRED;
    }

    const updatedOrder = await this.confirmReceivedTransactional(order);

    this.eventDispatcher.dispatch(events.actions.order.buy.userConfirmPayment, updatedOrder);
    this.log.debug('Stop implement ConfirmFiatSentUseCase: ', orderRefId);
    return null;
  }

  @Transactional({ isolationLevel: IsolationLevel.READ_COMMITTED })
  private async confirmReceivedTransactional(order: Order) {
    this.log.debug('Start implement confirmReceivedTransactional method for: ', order.id);
    const masterDataCommon = order.configuration ?? await this.sharedMasterDataService.getLatestMasterDataCommon();
    const payload = {
      status: OrderStatus.TO_BE_PAID,
      step: BUY_ORDER_STEPS.BUY_NOTIFY_SENT_FIAT_BY_USER,
      endedTime: moment.utc().add(masterDataCommon.merchantToUserTimeSell, 'minutes').toDate(),
    };
    await this.userOrderService.update(order.id, payload);
    await this.sharedStatisticService.updateOrderStatistic(order, BUY_ORDER_STEPS.BUY_NOTIFY_SENT_FIAT_BY_USER);
    await sendSystemNotification({ ...order, ...payload } as Order);

    return this.userOrderService.mergePayload(order, payload);
  }
}
