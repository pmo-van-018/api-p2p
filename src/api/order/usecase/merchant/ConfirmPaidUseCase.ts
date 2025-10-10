import {Logger, LoggerInterface} from '@base/decorators/Logger';
import {Service} from 'typedi';
import {OrderLifeCycleError} from '@api/order/errors/OrderLifeCycleError';
import {Operation} from '@api/profile/models/Operation';
import {MerchantOrderLifecycleService} from '@api/order/services/order/MerchantOrderLifecycleService';
import {BUY_ORDER_STEPS, Order, OrderStatus} from '@api/order/models/Order';
import {sendSystemNotification} from '@base/utils/chat-notification.utils';
import {events} from '@api/subscribers/events';
import {Transactional} from 'typeorm-transactional-cls-hooked';
import {SharedAppealService} from '@api/appeal/services/SharedAppealService';
import {SharedStatisticService} from '@api/statistic/services/SharedStatisticService';
import {EventDispatcher, EventDispatcherInterface} from '@base/decorators/EventDispatcher';
import {TradeType} from '@api/common/models';
import {TRANSACTION_DEFAULT_OPTIONS} from '@api/common/constants/TransactionConstant';

@Service()
export class ConfirmPaidUseCase {
  constructor(
    private merchantOrderService: MerchantOrderLifecycleService,
    private sharedAppealService: SharedAppealService,
    private sharedStatisticService: SharedStatisticService,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async confirmPaid(currentUser: Operation, orderRefId: string) {
    this.log.debug('Start implement confirmPaid method for: ', currentUser.type, currentUser.walletAddress);
    const order = await this.merchantOrderService.getFullInfoByRefId(orderRefId);
    if (!order || order.merchantId !== currentUser.id) {
      return OrderLifeCycleError.ORDER_NOT_FOUND;
    }
    if (order.type !== TradeType.BUY) {
      return OrderLifeCycleError.ORDER_TYPE_IS_INVALID;
    }
    if (order.isStatusNotEqual(OrderStatus.TO_BE_PAID)) {
      return OrderLifeCycleError.ORDER_STATUS_IS_INVALID;
    }

    const updatedOrder = await this.confirmPaidTransactional(order);

    await sendSystemNotification(updatedOrder);

    this.eventDispatcher.dispatch(events.actions.order.buy.merchantConfirmPayment, updatedOrder);

    this.log.debug('Stop implement confirmPaid method for: ', currentUser.type, currentUser.walletAddress);
    return updatedOrder;
  }

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  private async confirmPaidTransactional(order: Order) {
    this.log.debug('Start implement confirmPaidTransactional method for: ', order.id, order.status, order.step);
    const payload = {
      status: OrderStatus.PAID,
      step: BUY_ORDER_STEPS.BUY_CONFIRMED_FIAT_BY_MERCHANT,
    };
    await this.merchantOrderService.update(order.id, payload);
    if (order.appealId) {
      await this.sharedAppealService.pending(order.appealId);
    }
    await this.sharedStatisticService.updateOrderStatistic(order, BUY_ORDER_STEPS.BUY_CONFIRMED_FIAT_BY_MERCHANT);
    return this.merchantOrderService.mergePayload(order, payload);
  }
}
