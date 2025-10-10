import { SharedAppealService } from '@api/appeal/services/SharedAppealService';
import { PostStatus } from '@api/common/models';
import { OrderLifeCycleError } from '@api/order/errors/OrderLifeCycleError';
import { Order, OrderStatus, SELL_ORDER_STEP } from '@api/order/models/Order';
import { UserOrderLifecycleService } from '@api/order/services/order/UserOrderLifecycleService';
import { OrderOutBoxService } from '@api/outbox/services/OrderOutBoxService';
import { SharedPostService } from '@api/post/services/SharedPostService';
import { User } from '@api/profile/models/User';
import { SharedReferralService } from '@api/referral/services/SharedReferralService';
import { SharedStatisticService } from '@api/statistic/services/SharedStatisticService';
import { events } from '@api/subscribers/events';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { sendSystemNotification } from '@base/utils/chat-notification.utils';
import { delSortedCache, getRecommendPriceCacheKey } from '@base/utils/redis-client';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import { Service } from 'typedi';
import { IsolationLevel, Transactional } from 'typeorm-transactional-cls-hooked';

@Service()
export class ConfirmFiatReceivedUseCase {
  constructor(
    private userOrderService: UserOrderLifecycleService,
    private sharedAppealService: SharedAppealService,
    private sharedPostService: SharedPostService,
    private sharedStatisticService: SharedStatisticService,
    private sharedReferralService: SharedReferralService,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
    @Logger(__filename) private log: LoggerInterface,
    private readonly orderOutBoxService: OrderOutBoxService
  ) {}

  public async confirmReceived(currentUser: User, orderRefId: string) {
    this.log.debug('Start implement confirmReceived method for: ', currentUser.type, currentUser.walletAddress);
    const order = await this.userOrderService.getFullInfoByRefId(orderRefId);
    if (!order || order.userId !== currentUser.id) {
      return OrderLifeCycleError.ORDER_NOT_FOUND;
    }
    if (order.isStatusNotEqual(OrderStatus.PAID)) {
      return OrderLifeCycleError.ORDER_STATUS_IS_INVALID;
    }

    const validSteps = [
      SELL_ORDER_STEP.SELL_NOTIFY_SENT_FIAT_BY_MERCHANT_DEAL_TIME,
      SELL_ORDER_STEP.SELL_ENABLE_APPEAL_NOTIFY_SENT_FIAT_BY_MERCHANT,
    ];

    if (!validSteps.includes(order.step)) {
      return OrderLifeCycleError.RECEIVING_FIAT_CONFIRMATION_IS_FAILED;
    }

    await this.confirmReceivedTransactional(order);
    this.eventDispatcher.dispatch(events.actions.order.sell.userConfirmReceived, order);
    this.log.debug('Stop implement confirmReceived method for: ', currentUser.type, currentUser.walletAddress);
    return null;
  }

  @Transactional({ isolationLevel: IsolationLevel.READ_COMMITTED })
  private async confirmReceivedTransactional(order: Order): Promise<void> {
    this.log.debug('Start implement confirmReceivedTransactional method for: ', order.id);
    const feeAmount = this.userOrderService.calculateTotalFee(order);
    const payload = {
      status: OrderStatus.COMPLETED,
      cancelByUserId: null,
      step: SELL_ORDER_STEP.SELL_CONFIRMED_FIAT_BY_USER,
      completedTime: moment.utc().toDate(),
      totalFee: feeAmount,
    };
    await this.userOrderService.update(order.id, payload);
    this.log.debug('[confirmReceivedTransactional] handleReferralOrderCompleted: ', order.userId, order.id);
    this.sharedReferralService.handleReferralOrderCompleted(order.userId, order.id);

    this.log.debug(
      '[confirmReceivedTransactional] updateOrderStatistic: ',
      order.id,
      SELL_ORDER_STEP.SELL_CONFIRMED_FIAT_BY_USER
    );
    await this.sharedStatisticService.updateOrderStatistic(order, SELL_ORDER_STEP.SELL_CONFIRMED_FIAT_BY_USER);

    this.log.debug(
      '[confirmReceivedTransactional] updateFinishedAmountAndFee: ',
      order.postId,
      order.amount,
      feeAmount
    );
    await this.sharedPostService.updateFinishedAmountAndFee(order.post, order.amount, feeAmount);
    this.eventDispatcher.dispatch(events.actions.balanceConfig.reachedThreshold, {
      asset: order.asset,
      operation: order.merchant,
    });

    // refresh order info
    order = this.userOrderService.mergePayload(order, payload);

    if (order.appealId) {
      this.log.debug('[confirmReceived] check post sendSystemNotification ', order.id);
      await sendSystemNotification(order);
      await this.sharedAppealService.closeBySystem(order.appealId);
    }
    const post = await this.sharedPostService.getById(order.postId);
    if (post.hasAvailableAmountLessThanMinAmount()) {
      this.log.debug('[confirmReceived] check post hasAvailableAmountLessThanMinAmount ', post.id);
      const isEqualPostFullFill = new BigNumber(post.finishedAmount).isEqualTo(new BigNumber(post.totalAmount));
      await this.sharedPostService.updateStatus(post.id, isEqualPostFullFill ? PostStatus.CLOSE : PostStatus.OFFLINE);
      await delSortedCache(getRecommendPriceCacheKey({ assetId: post.assetId, postType: post.type }), post.id);
      // just do it when post status change from online
      if (post.status === PostStatus.ONLINE) {
        await this.sharedStatisticService.updatePostCount(order.merchantId, false);
      }
      if (isEqualPostFullFill) {
        this.eventDispatcher.dispatch(events.actions.system.availableAmountEqualZero, [order]);
      } else {
        this.eventDispatcher.dispatch(events.actions.system.availableAmountLessThanMinAmount, order);
      }
    }

    await this.orderOutBoxService.publishCompletedOrderEvent(order);
  }
}
