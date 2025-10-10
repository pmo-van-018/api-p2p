import { Service } from 'typedi';

import { TRANSACTION_DEFAULT_OPTIONS } from '@api/common/constants/TransactionConstant';
import { P2PError } from '@api/common/errors/P2PError';
import { PostStatus, TradeType } from '@api/common/models/P2PEnum';
import { ServiceResult } from '@api/infrastructure/helpers/ServiceResult';
import { SharedMasterDataService } from '@api/master-data/services/SharedMasterDataService';
import { CryptoTransactionError } from '@api/order/errors/CryptoTransactionError';
import { OrderLifeCycleError } from '@api/order/errors/OrderLifeCycleError';
import { CryptoTransaction, TransactionStatus } from '@api/order/models/CryptoTransaction';
import { Order, OrderStatus, SELL_ORDER_STEP } from '@api/order/models/Order';
import { OrderRepository } from '@api/order/repositories/OrderRepository';
import { CryptoTransactionService } from '@api/order/services/CryptoTransactionService';
import { SystemOrderLifecycleService } from '@api/order/services/order/SystemOrderLifecycleService';
import { OrderOutBoxService } from '@api/outbox/services/OrderOutBoxService';
import { PostError } from '@api/post/errors/PostError';
import { PostService } from '@api/post/services/PostService';
import { ReferralService } from '@api/referral/services/ReferralService';
import { SharedStatisticService } from '@api/statistic/services/SharedStatisticService';
import { events } from '@api/subscribers/events';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Spanning } from '@base/decorators/Tracing';
import { sendSystemNotification } from '@base/utils/chat-notification.utils';
import { delSortedCache, getRecommendPriceCacheKey } from '@base/utils/redis-client';
import { RedlockUtil } from '@base/utils/redlock';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class SystemSellOrderLifecycleService extends SystemOrderLifecycleService {
  constructor(
    @InjectRepository() protected orderRepository: OrderRepository,
    @Logger(__filename) protected log: LoggerInterface,
    protected masterDataService: SharedMasterDataService,
    protected referralService: ReferralService,
    private readonly orderOutBoxService: OrderOutBoxService,
    private postService: PostService,
    private statisticService: SharedStatisticService,
    private cryptoTransactionService: CryptoTransactionService,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {
    super(orderRepository, referralService, log, masterDataService);
  }

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  public async cancelOrder(orderId: string): Promise<ServiceResult<Order>> {
    const order = await this.findOneWithConditions(
      {
        id: orderId,
        type: TradeType.SELL,
      },
      { relations: ['merchant'] }
    );
    if (!order) {
      return ServiceResult.fail(OrderLifeCycleError.ORDER_NOT_FOUND);
    }
    if (order.isCountdownAutoCancel()) {
      return ServiceResult.fail(OrderLifeCycleError.SYSTEM_AUTO_CANCEL_COUNTDOWN_EXIST);
    }

    const lock = await RedlockUtil.acquire(this.getKeyPostLock(order.postId));
    try {
      await this.statisticService.updateOrderStatistic(order, SELL_ORDER_STEP.SELL_ORDER_CANCELLED_BY_SYSTEM);
      order.status = OrderStatus.CANCELLED;
      order.step = SELL_ORDER_STEP.SELL_ORDER_CANCELLED_BY_SYSTEM;
      order.paymentMethodId = null;
      const savedOrder = await this.save(order);
      if (!savedOrder) {
        return ServiceResult.fail(OrderLifeCycleError.SYSTEM_UPDATE_AUTO_CANCEL_FAIL);
      }
      await this.postService.updateAvailableAmount(order.postId, order.amount);

      const newOrder = await this.getFullInfoById({ id: order.id });
      if (!newOrder) {
        return ServiceResult.fail(OrderLifeCycleError.ORDER_NOT_FOUND);
      }
      const post = await this.postService.findOneWithConditions({ id: newOrder.postId });
      await sendSystemNotification(newOrder);
      this.eventDispatcher.dispatch(events.actions.order.sell.systemCancelOrder, { order: newOrder, post });
      return ServiceResult.success(order);
    } finally {
      await RedlockUtil.release(lock);
    }
  }

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  public async updateConfirmedReceivedFiat(id: string): Promise<ServiceResult<Order>> {
    const order = await this.getUncompletedById(id);
    if (!order || order.type !== TradeType.SELL) {
      return ServiceResult.fail(OrderLifeCycleError.ORDER_STATUS_IS_INVALID);
    }

    const lock = await RedlockUtil.acquire(this.getKeyPostLock(order.postId));
    try {
      const payload = {
        status: OrderStatus.COMPLETED,
        step: SELL_ORDER_STEP.SELL_CONFIRMED_FIAT_BY_USER,
        completedTime: moment.utc().toDate(),
        totalFee: this.calculateTotalFee(order),
      };
      this.referralService.handleReferralOrderCompleted(order.userId, order.id);
      const updatePost = await this.postService.updateFinishedAmountAndFee(
        order.postId,
        order.amount,
        payload.totalFee
      );
      if (!updatePost) {
        return ServiceResult.fail(PostError.POSTING_UPDATE_IS_FAILED);
      }

      if (updatePost.hasAvailableAmountLessThanMinAmount()) {
        const isEqualPostFullFill = new BigNumber(updatePost.finishedAmount).isEqualTo(
          new BigNumber(updatePost.totalAmount)
        );
        await this.postService.update(updatePost.id, {
          status: isEqualPostFullFill ? PostStatus.CLOSE : PostStatus.OFFLINE,
        });
        await delSortedCache(
          getRecommendPriceCacheKey({ assetId: updatePost.assetId, postType: updatePost.type }),
          updatePost.id
        );
        // just do it when post status change from online
        if (updatePost.status === PostStatus.ONLINE) {
          await this.statisticService.updatePostCount(order.merchantId, false);
        }
        if (isEqualPostFullFill) {
          this.eventDispatcher.dispatch(events.actions.system.availableAmountEqualZero, [order]);
        } else {
          this.eventDispatcher.dispatch(events.actions.system.availableAmountLessThanMinAmount, order);
        }
      }
      this.eventDispatcher.dispatch(events.actions.balanceConfig.reachedThreshold, {
        asset: order.asset,
        operation: order.merchant,
      });
      return this.saveAndDispatchEvent(order, payload, events.actions.order.sell.userConfirmReceived);
    } finally {
      await RedlockUtil.release(lock);
    }
  }

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  public async updateNotSendingFiat(id: string): Promise<ServiceResult<Order>> {
    const order = await this.getUncompletedById(id);
    if (!order || order.type !== TradeType.SELL) {
      return ServiceResult.fail(OrderLifeCycleError.ORDER_STATUS_IS_INVALID);
    }
    const masterDataCommon = await this.getOrderConfigurationOrMasterData(order);
    return this.saveAndDispatchEvent(
      order,
      {
        status: OrderStatus.PAID,
        step: SELL_ORDER_STEP.SELL_SENDING_CRYPTO_SUCCESS_DEAL_TIME,
        endedTime: moment.utc().add(masterDataCommon.userAskMerchantTime, 'minutes').toDate(),
      },
      events.actions.order.sell.systemUpdateStepOrder
    );
  }

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  public async updateEnableAppealWithAdminNotSendingFiat(id: string): Promise<ServiceResult<Order>> {
    const order = await this.getUncompletedById(id);
    if (!order || order.type !== TradeType.SELL) {
      return ServiceResult.fail(OrderLifeCycleError.ORDER_STATUS_IS_INVALID);
    }
    const masterDataCommon = await this.getOrderConfigurationOrMasterData(order);
    return this.saveAndDispatchEvent(
      order,
      {
        status: OrderStatus.PAID,
        step: SELL_ORDER_STEP.SELL_ENABLE_APPEAL_NOTIFY_SENT_FIAT_BY_MERCHANT,
        endedTime: moment.utc().add(masterDataCommon.userAskCSTime, 'minutes').toDate(),
      },
      events.actions.order.sell.systemUpdateStepOrder
    );
  }

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  public async updateSendingCrypto(id: string): Promise<ServiceResult<Order>> {
    const order = await this.getUncompletedById(id);
    if (!order || order.type !== TradeType.SELL) {
      return ServiceResult.fail(OrderLifeCycleError.ORDER_STATUS_IS_INVALID);
    }
    return this.saveAndDispatchEvent(
      order,
      {
        status: OrderStatus.CANCELLED,
        step: SELL_ORDER_STEP.SELL_ORDER_CANCELLED_BY_SYSTEM,
        completedTime: moment.utc().toDate(),
      },
      events.actions.order.sell.systemUpdateStepOrder
    );
  }

  @Spanning()
  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  public async updateTransactionStatus(
    {
      id,
      orderId,
      status,
      cryptoTransactionStatus,
      failCode,
    }: Pick<CryptoTransaction, 'id' | 'orderId' | 'status' | 'cryptoTransactionStatus' | 'failCode'>,
    isCancelImmediately = false
  ): Promise<ServiceResult<CryptoTransaction>> {
    const cryptoTransaction = await this.cryptoTransactionService.getByIdAndOrderId(id, orderId);
    if (!cryptoTransaction) {
      return ServiceResult.fail(CryptoTransactionError.NOT_FOUND);
    }
    if (![TransactionStatus.PENDING, TransactionStatus.UNKNOWN].includes(cryptoTransaction.status)) {
      return ServiceResult.fail(CryptoTransactionError.CRYPTO_TRANSACTION_ALREADY_EXISTS);
    }
    const order = await this.getUncompletedById(orderId);
    if (!order) {
      return ServiceResult.fail(OrderLifeCycleError.ORDER_IS_COMPLETED);
    }

    const lock = await RedlockUtil.acquire(this.getKeyPostLock(order.postId));
    try {
      cryptoTransaction.status = status;
      cryptoTransaction.cryptoTransactionStatus = cryptoTransactionStatus;
      cryptoTransaction.failCode = status === TransactionStatus.SUCCEED ? null : failCode;
      const cryptoTransactionResult = await this.cryptoTransactionService.save(cryptoTransaction);
      if (!cryptoTransactionResult) {
        return ServiceResult.fail(CryptoTransactionError.SYSTEM_UPDATE_STATUS_FAILED);
      }
      let retryTime: number;
      let numberOfAffectedOrder: number;
      let newOrderStep: SELL_ORDER_STEP;
      if (cryptoTransactionResult.status === TransactionStatus.SUCCEED) {
        numberOfAffectedOrder = await this.updateSendingCryptoSuccess(order);
        newOrderStep = SELL_ORDER_STEP.SELL_SENDING_CRYPTO_SUCCESS;
        await this.cryptoTransactionService.deleteLimiter(order.id);
      } else {
        retryTime = await this.cryptoTransactionService.submitTransactionLimiter(order.id);
        if (retryTime < 0 || isCancelImmediately) {
          numberOfAffectedOrder = await this.cancelOrderTransactional(order);
        } else {
          const transDuration = moment
            .duration(moment(cryptoTransaction.updatedAt).diff(moment(cryptoTransaction.createdAt)))
            .asSeconds();
          numberOfAffectedOrder = await this.updateSendingCryptoFailed(order, transDuration);
          newOrderStep = SELL_ORDER_STEP.SELL_SENDING_CRYPTO_FAILED;
        }
      }

      if (newOrderStep) {
        await this.statisticService.updateOrderStatistic(order, newOrderStep);
      }

      if (!numberOfAffectedOrder) {
        return ServiceResult.fail(OrderLifeCycleError.ORDER_CREATION_IS_FAILED);
      }
      const resultOrder = await this.getFullInfoById({ id: orderId });
      this.eventDispatcher.dispatch(events.actions.order.sell.systemUpdateTransactionStatus, {
        order: resultOrder,
        cryptoTransaction,
        retryTime,
      });

      await this.orderOutBoxService.publishCompletedOrderEvent(resultOrder);

      return ServiceResult.success(cryptoTransaction);
    } finally {
      await RedlockUtil.release(lock);
    }
  }

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  public async updateTransactionUnknownStatus({
    id,
    orderId,
    failCode,
    cryptoTransactionStatus,
  }: Pick<CryptoTransaction, 'id' | 'orderId' | 'failCode' | 'cryptoTransactionStatus'>): Promise<
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
    cryptoTransaction.status = TransactionStatus.UNKNOWN;
    cryptoTransaction.failCode = failCode;
    cryptoTransaction.cryptoTransactionStatus = cryptoTransactionStatus;
    const cryptoTransactionResult = await this.cryptoTransactionService.save(cryptoTransaction);
    if (!cryptoTransactionResult) {
      return ServiceResult.fail(CryptoTransactionError.SYSTEM_UPDATE_STATUS_FAILED);
    }
    order.cryptoTransactions.forEach((transaction) => {
      if (transaction.id === cryptoTransactionResult.id) {
        transaction.status = TransactionStatus.UNKNOWN;
      }
    });
    this.eventDispatcher.dispatch(events.actions.order.sell.rpcUnknowError, {
      order,
    });
    return ServiceResult.success(cryptoTransaction);
  }

  protected getKeyPostLock(key: string | number): string {
    return `post-sell-${key}`;
  }

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  private async saveAndDispatchEvent(
    order: Order,
    payload: any,
    event: string = events.actions.order.buy.systemUpdateStep
  ): Promise<ServiceResult<Order>> {
    await this.update(order.id, payload);
    if (payload.step) {
      await this.statisticService.updateOrderStatistic(order, payload.step);
    }
    const newOrder = await this.getFullInfoById({ id: order.id });
    if (!newOrder) {
      return ServiceResult.fail(OrderLifeCycleError.ORDER_NOT_FOUND);
    }
    const stepNotSendMessage = [
      SELL_ORDER_STEP.SELL_SENDING_CRYPTO_SUCCESS_DEAL_TIME,
      SELL_ORDER_STEP.SELL_NOTIFY_SENT_FIAT_BY_MERCHANT_DEAL_TIME,
    ];
    if (!stepNotSendMessage.includes(newOrder.step)) {
      await sendSystemNotification(newOrder);
    }

    this.eventDispatcher.dispatch(event, newOrder);

    await this.orderOutBoxService.publishCompletedOrderEvent(newOrder);

    return ServiceResult.success(newOrder);
  }

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  private async cancelOrderTransactional(order: Order): Promise<number> {
    try {
      const numberOfAffectedOrder = await this.cancelSellOrderSendCryptoFailed(order);
      await this.postService.updateAvailableAmount(order.postId, order.amount);
      await this.statisticService.updateOrderStatistic(order, SELL_ORDER_STEP.SELL_ORDER_CANCELLED_BY_SYSTEM);
      return numberOfAffectedOrder;
    } catch (error: any) {
      throw new P2PError(OrderLifeCycleError.ORDER_CANCELATION_FAILED);
    }
  }
}
