import { Service } from 'typedi';

import { ServiceResult } from '@api/infrastructure/helpers/ServiceResult';
import { CryptoTransactionError } from '@api/order/errors/CryptoTransactionError';
import { OrderLifeCycleError } from '@api/order/errors/OrderLifeCycleError';
import { CryptoTransaction, TransactionStatus } from '@api/order/models/CryptoTransaction';
import { BUY_ORDER_STEPS, Order, OrderStatus } from '@api/order/models/Order';
import { PostError } from '@api/post/errors/PostError';
import { events } from '@api/subscribers/events';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';

import { AppealStatus } from '@api/appeal/models/Appeal';
import { SharedAppealService } from '@api/appeal/services/SharedAppealService';
import { TRANSACTION_DEFAULT_OPTIONS } from '@api/common/constants/TransactionConstant';
import { P2PError } from '@api/common/errors/P2PError';
import { PostStatus, TradeType } from '@api/common/models/P2PEnum';
import { SharedMasterDataService } from '@api/master-data/services/SharedMasterDataService';
import { OrderRepository } from '@api/order/repositories/OrderRepository';
import { CryptoTransactionService } from '@api/order/services/CryptoTransactionService';
import { SystemOrderLifecycleService } from '@api/order/services/order/SystemOrderLifecycleService';
import { OrderOutBoxService } from '@api/outbox/services/OrderOutBoxService';
import { PostService } from '@api/post/services/PostService';
import { ReferralService } from '@api/referral/services/ReferralService';
import { SharedStatisticService } from '@api/statistic/services/SharedStatisticService';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { sendSystemNotification } from '@base/utils/chat-notification.utils';
import { delSortedCache, getRecommendPriceCacheKey } from '@base/utils/redis-client';
import { RedlockUtil } from '@base/utils/redlock';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class SystemBuyOrderLifecycleService extends SystemOrderLifecycleService {
  constructor(
    @InjectRepository() protected orderRepository: OrderRepository,
    @Logger(__filename) protected log: LoggerInterface,
    protected masterDataService: SharedMasterDataService,
    protected referralService: ReferralService,
    private appealService: SharedAppealService,
    private postService: PostService,
    private statisticService: SharedStatisticService,
    private cryptoTransactionService: CryptoTransactionService,
    private readonly orderOutBoxService: OrderOutBoxService,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {
    super(orderRepository, referralService, log, masterDataService);
  }

  public async cancelOrder(orderId: string): Promise<ServiceResult<Order>> {
    const order = await this.getFullInfoById({ id: orderId });
    if (!order) {
      return ServiceResult.fail(OrderLifeCycleError.ORDER_NOT_FOUND);
    }
    if (order.isCountdownAutoCancel()) {
      return ServiceResult.fail(OrderLifeCycleError.SYSTEM_AUTO_CANCEL_COUNTDOWN_EXIST);
    }

    const lock = await RedlockUtil.acquire(this.getKeyPostLock(order.postId));
    try {
      await this.cancelOrderTransactional(order);
      order.status = OrderStatus.CANCELLED;
      order.step = BUY_ORDER_STEPS.BUY_ORDER_CANCELLED_BY_SYSTEM;
      order.paymentMethodId = null;

      const post = await this.postService.findOneWithConditions({ id: order.postId });
      await sendSystemNotification(order);

      this.eventDispatcher.dispatch(events.actions.order.buy.systemCancelOrder, { order, post });
      return ServiceResult.success(order);
    } catch (error: any) {
      return ServiceResult.fail(PostError.POSTING_UPDATE_IS_FAILED);
    } finally {
      await RedlockUtil.release(lock);
    }
  }

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  public async updateTransactionStatus({
    id,
    orderId,
    status,
    failCode,
    cryptoTransactionStatus,
  }: Pick<CryptoTransaction, 'id' | 'orderId' | 'status' | 'failCode' | 'cryptoTransactionStatus'>): Promise<
    ServiceResult<CryptoTransaction>
  > {
    const cryptoTransaction = await this.cryptoTransactionService.getByIdAndOrderId(id, orderId);
    if (!cryptoTransaction) {
      return ServiceResult.fail(CryptoTransactionError.NOT_FOUND);
    }
    if (!cryptoTransaction.isStatusMatch(TransactionStatus.PENDING)) {
      return ServiceResult.fail(CryptoTransactionError.CRYPTO_TRANSACTION_ALREADY_EXISTS);
    }
    const order = await this.getUncompletedById(orderId);
    if (!order) {
      return ServiceResult.fail(OrderLifeCycleError.ORDER_IS_COMPLETED);
    }

    const lock = await RedlockUtil.acquire(this.getKeyPostLock(order.postId));
    try {
      cryptoTransaction.status = status;
      cryptoTransaction.failCode = status === TransactionStatus.SUCCEED ? null : failCode;
      cryptoTransaction.cryptoTransactionStatus = cryptoTransactionStatus;
      const cryptoTransactionResult = await this.cryptoTransactionService.save(cryptoTransaction);
      if (!cryptoTransactionResult) {
        return ServiceResult.fail(CryptoTransactionError.SYSTEM_UPDATE_STATUS_FAILED);
      }

      let numberOfAffectedOrder: number;
      let newStep: BUY_ORDER_STEPS;
      if (cryptoTransactionResult.status === TransactionStatus.SUCCEED) {
        numberOfAffectedOrder = await this.finishOrderTransactional(order);
        newStep = BUY_ORDER_STEPS.BUY_SENDING_CRYPTO_SUCCESS;
      } else {
        numberOfAffectedOrder = await this.updateSendingCryptoFailed(order);
        newStep = BUY_ORDER_STEPS.BUY_SENDING_CRYPTO_FAILED;
        if (order.appeal && order.appeal.status === AppealStatus.PENDING) {
          await this.appealService.openAppeal(order.appealId);
        }
      }
      await this.statisticService.updateOrderStatistic(order, newStep);

      if (!numberOfAffectedOrder) {
        return ServiceResult.fail(OrderLifeCycleError.ORDER_CREATION_IS_FAILED);
      }
      const post = await this.postService.getById(order.postId);
      if (post.hasAvailableAmountLessThanMinAmount()) {
        const isEqualPostFullFill = new BigNumber(post.finishedAmount).isEqualTo(new BigNumber(post.totalAmount));
        await this.postService.update(post.id, {
          status: isEqualPostFullFill ? PostStatus.CLOSE : PostStatus.OFFLINE,
        });
        await delSortedCache(getRecommendPriceCacheKey({ assetId: post.assetId, postType: post.type }), post.id);
        // just do it when post status change from online
        if (post.status === PostStatus.ONLINE) {
          await this.statisticService.updatePostCount(order.merchantId, false);
        }
        if (isEqualPostFullFill) {
          this.eventDispatcher.dispatch(events.actions.system.availableAmountEqualZero, [order]);
        } else {
          this.eventDispatcher.dispatch(events.actions.system.availableAmountLessThanMinAmount, order);
        }
      }

      const resultOrder = await this.getFullInfoById({ id: orderId });
      await this.orderOutBoxService.publishCompletedOrderEvent(resultOrder);

      this.eventDispatcher.dispatch(events.actions.order.buy.systemUpdateTransactionStatus, {
        order: resultOrder,
        cryptoTransaction,
      });

      return ServiceResult.success(cryptoTransaction);
    } finally {
      try {
        await RedlockUtil.release(lock);
      } catch (error) {
        this.log.error('Release lock failed', error);
      }
    }
  }

  public async updateAppealSendingFiat(id: string): Promise<ServiceResult<Order>> {
    const order = await this.getUncompletedById(id);
    if (!order || order.type !== TradeType.BUY) {
      return ServiceResult.fail(OrderLifeCycleError.ORDER_STATUS_IS_INVALID);
    }
    const masterDataCommon = await this.getOrderConfigurationOrMasterData(order);
    return this.saveAndDispatchEvent(order, {
      endedTime: moment.utc().add(masterDataCommon.userAskMerchantTime, 'minutes').toDate(),
      status: OrderStatus.TO_BE_PAID,
      step: BUY_ORDER_STEPS.BUY_ORDER_CREATED_BY_USER_DEAL_TIME,
    });
  }

  public async updateAppealReceiveFiat(id: string): Promise<ServiceResult<Order>> {
    const order = await this.getUncompletedById(id);
    if (!order || order.type !== TradeType.BUY) {
      return ServiceResult.fail(OrderLifeCycleError.ORDER_STATUS_IS_INVALID);
    }
    const masterDataCommon = await this.getOrderConfigurationOrMasterData(order);
    return this.saveAndDispatchEvent(order, {
      endedTime: moment.utc().add(masterDataCommon?.userAskCSTime, 'minutes').toDate(),
      status: OrderStatus.TO_BE_PAID,
      step: BUY_ORDER_STEPS.BUY_ENABLE_APPEAL_WHILE_CONFIRMING_FIAT_BY_MERCHANT,
    });
  }

  public async updateAppealNotReceiveFiat(id: string): Promise<ServiceResult<Order>> {
    const order = await this.getUncompletedById(id);
    if (!order || order.type !== TradeType.BUY) {
      return ServiceResult.fail(OrderLifeCycleError.ORDER_STATUS_IS_INVALID);
    }
    const masterDataCommon = await this.getOrderConfigurationOrMasterData(order);
    return this.saveAndDispatchEvent(order, {
      endedTime: moment.utc().add(masterDataCommon.userAskCSTime, 'minutes').toDate(),
      status: OrderStatus.PAID,
      step: BUY_ORDER_STEPS.BUY_CONFIRMED_FIAT_BY_MERCHANT_DEAL_TIME,
    });
  }

  public async updateAppealMerchantNotFiat(id: string): Promise<ServiceResult<Order>> {
    const order = await this.getUncompletedById(id);
    if (!order || order.type !== TradeType.BUY) {
      return ServiceResult.fail(OrderLifeCycleError.ORDER_STATUS_IS_INVALID);
    }
    const masterDataCommon = await this.getOrderConfigurationOrMasterData(order);
    return this.saveAndDispatchEvent(order, {
      endedTime: moment.utc().add(masterDataCommon.userAskCSTime, 'minutes').toDate(),
    });
  }

  public async updateAppealConfirmingFiat(id: string): Promise<ServiceResult<Order>> {
    const order = await this.getUncompletedById(id);
    if (!order || order.type !== TradeType.BUY) {
      return ServiceResult.fail(OrderLifeCycleError.ORDER_STATUS_IS_INVALID);
    }
    const masterDataCommon = await this.getOrderConfigurationOrMasterData(order);
    return this.saveAndDispatchEvent(order, {
      endedTime: moment.utc().add(masterDataCommon.userAskMerchantTime, 'minutes').toDate(),
      status: OrderStatus.TO_BE_PAID,
      step: BUY_ORDER_STEPS.BUY_NOTIFY_SENT_FIAT_BY_USER_DEAL_TIME,
    });
  }

  protected getKeyPostLock(key: string | number): string {
    return `post-buy-${key}`;
  }

  private async saveAndDispatchEvent(
    order: Order,
    payload: any,
    event: string = events.actions.order.buy.systemUpdateStep
  ): Promise<ServiceResult<Order>> {
    await this.update(order.id, payload);
    const newOrder = await this.getFullInfoById({ id: order.id });
    if (!newOrder) {
      return ServiceResult.fail(OrderLifeCycleError.ORDER_NOT_FOUND);
    }
    if (payload.step) {
      await this.statisticService.updateOrderStatistic(order, payload.step);
      const stepNotSendMessage = [
        BUY_ORDER_STEPS.BUY_NOTIFY_SENT_FIAT_BY_USER_DEAL_TIME,
        BUY_ORDER_STEPS.BUY_CONFIRMED_FIAT_BY_MERCHANT,
        BUY_ORDER_STEPS.BUY_CONFIRMED_FIAT_BY_MERCHANT_DEAL_TIME,
      ];
      if (!stepNotSendMessage.includes(newOrder.step)) {
        await sendSystemNotification(newOrder);
      }
    }

    this.eventDispatcher.dispatch(event, newOrder);
    return ServiceResult.success(newOrder);
  }

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  private async finishOrderTransactional(order: Order): Promise<number> {
    try {
      const numberOfAffectedOrder = await this.updateSendingCryptoSuccess(order);
      await this.postService.updateFinishedAmountAndFee(order.postId, order.amount, this.calculateTotalFee(order));
      if (order.appealId) {
        await this.appealService.closeBySystem(order.appealId);
      }
      return numberOfAffectedOrder;
    } catch (error: any) {
      throw new P2PError(OrderLifeCycleError.ORDER_CANCELATION_FAILED);
    }
  }

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  private async cancelOrderTransactional(order: Order): Promise<void> {
    try {
      await this.update(order.id, {
        status: OrderStatus.CANCELLED,
        paymentMethodId: null,
        step: BUY_ORDER_STEPS.BUY_ORDER_CANCELLED_BY_SYSTEM,
        completedTime: moment.utc().toDate(),
      });
      await this.postService.updateAvailableAmount(order.postId, order.amount);
      await this.statisticService.updateOrderStatistic(order, BUY_ORDER_STEPS.BUY_ORDER_CANCELLED_BY_SYSTEM);
      if (order.appealId) {
        await this.appealService.closeBySystem(order.appealId);
      }
    } catch (e) {
      throw new P2PError(OrderLifeCycleError.SYSTEM_UPDATE_AUTO_CANCEL_FAIL);
    }
  }
}
