import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import { User } from '@api/profile/models/User';
import { OrderLifeCycleError } from '@api/order/errors/OrderLifeCycleError';
import { UserOrderLifecycleService } from '@api/order/services/order/UserOrderLifecycleService';
import { Order, OrderStatus, SELL_ORDER_STEP } from '@api/order/models/Order';
import { sendSystemNotification } from '@base/utils/chat-notification.utils';
import { events} from '@api/subscribers/events';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import moment from 'moment';
import { SharedAppealService } from '@api/appeal/services/SharedAppealService';
import { SharedPostService } from '@api/post/services/SharedPostService';
import { SharedStatisticService } from '@api/statistic/services/SharedStatisticService';
import {TRANSACTION_DEFAULT_OPTIONS} from '@api/common/constants/TransactionConstant';

@Service()
export class CancelSellOrderUseCase {
  constructor(
    private userOrderService: UserOrderLifecycleService,
    private sharedAppealService: SharedAppealService,
    private sharedPostService: SharedPostService,
    private sharedStatisticService: SharedStatisticService,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async cancelOrder(currentUser: User, orderRefId: string) {
    this.log.debug('Start implement cancelSellOrder method for: ', currentUser.id);
    const order = await this.userOrderService.getFullInfoByRefId(orderRefId);
    if (!order || order.userId !== currentUser.id) {
      return OrderLifeCycleError.ORDER_NOT_FOUND;
    }
    if (order.isStatusNotEqual(OrderStatus.TO_BE_PAID)) {
      return OrderLifeCycleError.SELL_ORDER_STATUS_IS_INVALID;
    }
    if (order.isUserCancelExpired()) {
      return OrderLifeCycleError.SELL_ORDER_TIMEOUT;
    }

    await this.cancelOrderTransactional(order);

    const updatedOrder = await this.userOrderService.getFullInfoByRefId(orderRefId);

    this.log.debug('[cancelOrder] sendSystemNotification ', currentUser.type, currentUser.walletAddress);
    await sendSystemNotification(updatedOrder);
    this.eventDispatcher.dispatch(events.actions.order.sell.userCancelOrder, updatedOrder);

    this.log.debug('Stop implement cancelSellOrder method for: ', currentUser.id);
    return updatedOrder;
  }

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  private async cancelOrderTransactional(order: Order): Promise<void> {
    await this.sharedPostService.updateAvailableAmount(order.post, order.amount);
    await this.userOrderService.update(order.id, {
      status: OrderStatus.CANCELLED,
      cancelByUserId: order.userId,
      paymentMethodId: null,
      step: SELL_ORDER_STEP.SELL_ORDER_CANCELLED_BY_USER,
      completedTime: moment.utc().toDate(),
    });
    if (order.appealId) {
      await this.sharedAppealService.closeBySystem(order.appealId);
    }
    await this.sharedStatisticService.updateOrderStatistic(order, SELL_ORDER_STEP.SELL_ORDER_CANCELLED_BY_USER);
  }
}
