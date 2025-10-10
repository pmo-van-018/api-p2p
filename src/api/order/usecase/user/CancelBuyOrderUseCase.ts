import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import { User } from '@api/profile/models/User';
import { OrderLifeCycleError } from '@api/order/errors/OrderLifeCycleError';
import { UserOrderLifecycleService } from '@api/order/services/order/UserOrderLifecycleService';
import { BUY_ORDER_STEPS, Order, OrderStatus } from '@api/order/models/Order';
import { sendSystemNotification } from '@base/utils/chat-notification.utils';
import { events} from '@api/subscribers/events';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import {IsolationLevel, Transactional} from 'typeorm-transactional-cls-hooked';
import moment from 'moment';
import { SharedAppealService } from '@api/appeal/services/SharedAppealService';
import { SharedPostService } from '@api/post/services/SharedPostService';
import { SharedStatisticService } from '@api/statistic/services/SharedStatisticService';

@Service()
export class CancelBuyOrderUseCase {
  constructor(
    private userOrderService: UserOrderLifecycleService,
    private sharedAppealService: SharedAppealService,
    private sharedPostService: SharedPostService,
    private sharedStatisticService: SharedStatisticService,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async cancelOrder(currentUser: User, orderRefId: string) {
    this.log.debug('Start implement cancelBuyOrder method for: ', currentUser.id);
    const order = await this.userOrderService.getFullInfoByRefId(orderRefId);
    if (!order || order.userId !== currentUser.id) {
      return OrderLifeCycleError.ORDER_NOT_FOUND;
    }
    if (order.isStatusNotEqual(OrderStatus.TO_BE_PAID)) {
      return OrderLifeCycleError.ORDER_STATUS_IS_CANCELLED_OR_FINISHED;
    }
    if (order.isUserCancelExpired()) {
      return OrderLifeCycleError.CANCEL_TIMEOUT;
    }

    const updatedOrder = await this.cancelBuyOrderTransactional(order);

    this.log.debug('[cancelOrder] sendSystemNotification ', currentUser.type, currentUser.walletAddress);
    await sendSystemNotification(updatedOrder);
    this.eventDispatcher.dispatch(events.actions.order.buy.userCancelled, updatedOrder);

    this.log.debug('Stop implement cancelBuyOrder method for: ', currentUser.id);
    return null;
  }

  @Transactional({ isolationLevel: IsolationLevel.READ_COMMITTED })
  private async cancelBuyOrderTransactional(order: Order) {
    await this.sharedPostService.updateAvailableAmount(order.post, order.amount);
    const payload = {
      status: OrderStatus.CANCELLED,
      cancelByUserId: order.userId,
      paymentMethodId: null,
      step: BUY_ORDER_STEPS.BUY_ORDER_CANCELLED_BY_USER,
      completedTime: moment.utc().toDate(),
    };
    await this.userOrderService.update(order.id, payload);
    await this.sharedStatisticService.updateOrderStatistic(order, BUY_ORDER_STEPS.BUY_ORDER_CANCELLED_BY_USER);
    if (order.appealId) {
      order.step = BUY_ORDER_STEPS.BUY_ORDER_CANCELLED_BY_USER;
      await sendSystemNotification(order);
      await this.sharedAppealService.closeBySystem(order.appealId);
    }
    return this.userOrderService.mergePayload(order, payload);
  }
}
