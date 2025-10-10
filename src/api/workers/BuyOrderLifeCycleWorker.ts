import { Job, QueueBaseOptions } from 'bullmq';
import { plainToInstance } from 'class-transformer';
import moment from 'moment';
import pLimit from 'p-limit';
import { Observable, of, Subject } from 'rxjs';
import { Service } from 'typedi';

import { events } from '@api/subscribers/events';
import { env } from '@base/env';
import { WorkerConfig } from './WorkerConfig';
import { WorkerInterface } from './WorkerInterface';

import { SocketFactory } from '@api/sockets/SocketFactory';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { formatCrypto } from '@base/utils/amount.utils';

import { QUEUE_NAME } from '@api/common/models/P2PConstant';
import { ServiceResult } from '@api/infrastructure/helpers/ServiceResult';
import { SharedNotificationService } from '@api/notification/services/SharedNotificationService';
import { CryptoTransaction, TransactionStatus } from '@api/order/models/CryptoTransaction';
import { SystemBuyOrderLifecycleService } from '@api/order/services/order/buy';
import { SharedOrderService } from '@api/order/services/order/SharedOrderService';
import { Post } from '@api/post/models/Post';
import { BullMQService } from '@base/job-queue/BullMQ/BullMQService';
import { NOTIFICATION_TYPE, NotificationType, TradeType } from '../common/models';
import { BUY_ORDER_STEPS, Order } from '../order/models/Order';
import { SharedProfileService } from '@api/profile/services/SharedProfileService';

import Timeout = NodeJS.Timeout;
import { EventUserOrderInfoResponse } from '@api/order/responses/EventSubscriber/User';
import { EventOperationOrderInfoResponse } from '@api/order/responses/EventSubscriber/Operation';
import { OrderStatisticUtil } from '@base/utils/orderStatistic';
import { closeChatRoom } from '@base/utils/chat.utils';
import { OpenAppealBuyOrderUseCase } from '@api/appeal/usecase/OpenAppealBuyOrderUseCase';
import { SharedStatisticService } from '@api/statistic/services/SharedStatisticService';

@Service()
export default class BuyOrderLifeCycleWorker implements WorkerInterface {
  private subject: Subject<any>;
  private interval: Timeout | number;
  private done: boolean;
  private orderProcessMap: Map<string, Order> = new Map<string, Order>();
  private orderBlacklistMap: Set<string> = new Set<string>();

  private readonly QUEUE_NAME = QUEUE_NAME.BUY_ORDER;

  private bullConfig: QueueBaseOptions = {
    connection: {
      host: env.redis.host,
      port: env.redis.port,
      connectTimeout: 50000,
      keepAlive: 30000,
    },
  };

  private readonly _bullMQService: BullMQService;

  constructor(
    @Logger(__filename) private log: LoggerInterface,
    private config: WorkerConfig,
    private orderService: SharedOrderService,
    private operationService: SharedProfileService,
    private systemBuyOrderLifecycleService: SystemBuyOrderLifecycleService,
    private notificationService: SharedNotificationService,
    private socketFactory: SocketFactory,
    private statisticService: SharedStatisticService,
    private openAppealBuyOrderUseCase: OpenAppealBuyOrderUseCase
  ) {
    this._bullMQService = new BullMQService();
    this._bullMQService.createWorker(this.QUEUE_NAME, this.getWorkerProcessor(), this.getWorkerOpts());
  }

  public async start(): Promise<Observable<any>> {
    this.log.info('+++ Start NewOrderLifeCycleWorker +++');
    if (this.subject) {
      return this.subject;
    }

    this.subject = new Subject<any>();

    const orders = await this.orderService.getCountdownOrderBuyList();
    if (orders !== null) {
      orders.map((order) => this.orderProcessMap.set(order.id, order));
      this.log.info(`Total orders processing: ${this.orderProcessMap.size}`);
    }
    // Get order in blacklist
    const orderBlacklist = await this.orderService.getBuyOrdersByBlackList();
    if (orderBlacklist?.length) {
      orderBlacklist.forEach((order) => {
        this.orderBlacklistMap.add(order.id);
        if (!this.orderProcessMap.has(order.id)) {
          this.orderProcessMap.set(order.id, order);
        }
      });
      this.log.info(`Total orders in blacklist: ${this.orderBlacklistMap.size}`);
    }

    this.subject.next(this.processOrderCountdown());

    this.interval = setInterval(() => {
      if (this.done) {
        this.subject.next(this.processOrderCountdown());
      }
    }, this.config.runOrderInterval);

    return this.subject;
  }

  public async stop(): Promise<Observable<any>> {
    this.log.info('+++ Stopping BuyOrderLifeCycleWorker +++');
    if (this.interval) {
      clearInterval(this.interval);
    }

    if (this.subject) {
      this.subject.complete();
    }

    return this.subject || of();
  }

  private getWorkerProcessor() {
    return async (job: Job) => {
      this.log.info(`Hanlde event ${job.name} with id: ${job.id}`);

      const orderRequest: Order = job.data['order'];
      const postRequest: Order = job.data['post'];
      const orderId: string = job.data['orderId'];
      const cryptoTransactionRequest: CryptoTransaction = job.data['cryptoTransaction'];
      switch (job.name) {
        case events.actions.order.buy.userCreateBuyOrder:
          await this.handleUserCreateOrder({ order: plainToInstance(Order, orderRequest) });
          break;
        case events.actions.order.buy.userConfirmPayment:
          await this.handleUserConfirmPaymentOrder({ order: plainToInstance(Order, orderRequest) });
          break;
        case events.actions.order.buy.merchantConfirmPayment:
          await this.handleMerchantConfirmPaymentOrder({ order: plainToInstance(Order, orderRequest) });
          break;
        case events.actions.order.buy.userCancelled:
          await this.handleUserCancelOrder({ order: plainToInstance(Order, orderRequest) });
          break;
        case events.actions.order.buy.merchantSubmitTransaction:
          await this.handleMerchantSubmitTransactionOrder({ order: plainToInstance(Order, orderRequest) });
          break;
        case events.actions.order.buy.systemUpdateTransactionStatus:
          await this.handleSystemUpdateTransactionStatusOrder({
            order: plainToInstance(Order, orderRequest),
            cryptoTransaction: plainToInstance(CryptoTransaction, cryptoTransactionRequest),
          });
          break;
        case events.actions.order.buy.systemUpdateStep:
          await this.handleSystemUpdateStepOrder({ order: plainToInstance(Order, orderRequest) });
          break;
        case events.actions.order.buy.systemUpdateAppealTimeout:
          await this.handleSystemUpdateAppealTimeoutOrder({ order: plainToInstance(Order, orderRequest) });
          break;
        case events.actions.order.buy.systemCancelOrder:
          await this.handleSystemCancelOrder({
            order: plainToInstance(Order, orderRequest),
            post: plainToInstance(Post, postRequest),
          });
          break;
        case events.actions.order.buy.systemFinishOrder:
          await this.handleSystemFinishOrder({ order: plainToInstance(Order, orderRequest) });
          break;
        case events.actions.order.buy.operatorCreateChatRoom:
          await this.handleOperatorCreateChatRoomOrderBuy(plainToInstance(Order, orderRequest));
          break;
        case events.actions.order.buy.adminAddToBacklist:
          await this.handleOrderInBlacklist(orderId);
          break;
        default:
          break;
      }
    };
  }

  private async handleOperatorCreateChatRoomOrderBuy(order: Order) {
    this.handleEmitResponseOrder(order, events.actions.order.buy.operatorCreateChatRoom);
  }

  private handleEmitResponseOrder(order: Order, event: string) {
    const operationOrderResponse = new EventOperationOrderInfoResponse(order);
    const userOrderResponse = new EventUserOrderInfoResponse(order);

    this.emitOrder(order.user.walletAddress, userOrderResponse, event);
    this.emitOrder(
      this.operationService.isUserBlocked(order.merchant)
        ? order.merchant?.merchantManager?.walletAddress
        : order.merchant.walletAddress,
      operationOrderResponse,
      event
    );
  }
  private async handleUserCreateOrder(payload: { order: Order }) {
    const { order } = payload;
    this.orderProcessMap.set(order.id, order);

    this.handleEmitResponseOrder(order, events.actions.order.buy.userCreateBuyOrder);
    this.emitStatisticRelatedToOrder(order);
    await this.notificationService.createNotification({
      notificationCase: NOTIFICATION_TYPE.BUY_ORDER_CREATED_BY_USER,
      transactionId: order.id,
      transactionRefId: order.refId,
      transactionType: order.type,
      username: order.user.nickName || order.user.walletAddress,
      amount: formatCrypto(order.amount),
      currency: order.asset.name,
      type: NotificationType.TRANSACTION,
      walletAddress: order.user.walletAddress,
      endUserId: order.user.id,
      merchantId: order.merchant.id,
    });
  }

  private async handleOrderInBlacklist(orderId: string) {
    this.orderBlacklistMap.add(orderId);
  }

  private async handleUserConfirmPaymentOrder(payload: { order: Order }) {
    const { order } = payload;
    this.orderProcessMap.set(order.id, order);

    this.handleEmitResponseOrder(order, events.actions.order.buy.userConfirmPayment);
    this.emitStatisticRelatedToOrder(order);
  }

  private async handleMerchantConfirmPaymentOrder(payload: { order: Order }) {
    const { order } = payload;
    this.orderProcessMap.set(order.id, order);

    this.handleEmitResponseOrder(order, events.actions.order.buy.merchantConfirmPayment);
    this.emitStatisticRelatedToOrder(order);
  }

  private async handleUserCancelOrder(payload: { order: Order }) {
    const { order } = payload;
    this.orderProcessMap.delete(order.id);
    this.handleEmitResponseOrder(order, events.actions.order.buy.userCancelled);
    if (order.supporterId) {
      const orderResponse = new EventOperationOrderInfoResponse(order);
      this.emitOrder([order.supporter?.walletAddress], orderResponse, events.actions.order.buy.userCancelled);
    }
    this.emitStatisticRelatedToOrder(order);
    if (order.appealId) {
      await this.notificationService.createNotification({
        notificationCase: NOTIFICATION_TYPE.ORDER_CANCELLED_BY_USER,
        transactionRefId: order.refId,
        type: NotificationType.TRANSACTION,
        merchantId: order.merchantId,
      });
    }
    if (order.supporterId) {
      await this.notificationService.createNotification({
        notificationCase: NOTIFICATION_TYPE.ADMIN_NOTIFY_MERCHANT_SUPPORTER_ORDER_IS_CANCELED,
        orderIds: [order.refId],
        type: NotificationType.TRANSACTION,
        merchantSupporterId: order.supporterId,
      });
    }
    if (order.roomId) {
      try {
        await closeChatRoom({ roomId: order.roomId });
      } catch (error) {
        this.log.error(`Error when close chat room: ${order.roomId} - ${error}`);
      }
    }
  }

  private async handleMerchantSubmitTransactionOrder(payload: { order: Order }) {
    const { order } = payload;
    this.orderProcessMap.delete(order.id);
    this.handleEmitResponseOrder(order, events.actions.order.buy.merchantSubmitTransaction);
    this.emitStatisticRelatedToOrder(order);
  }

  private async handleSystemUpdateTransactionStatusOrder(payload: {
    order: Order;
    cryptoTransaction: CryptoTransaction;
  }) {
    const { order, cryptoTransaction } = payload;
    this.orderProcessMap.set(order.id, order);
    this.handleEmitResponseOrder(order, events.actions.order.buy.systemUpdateTransactionStatus);
    this.emitStatisticRelatedToOrder(order);
    // Due to business, unlink supporter from order when fullfill.
    if (cryptoTransaction.status === TransactionStatus.SUCCEED && order.supporterId) {
      await this.notificationService.createNotification({
        notificationCase: NOTIFICATION_TYPE.ADMIN_NOTIFY_MERCHANT_SUPPORTER_ORDER_IS_COMPLETED,
        orderIds: [order.refId],
        type: NotificationType.TRANSACTION,
        merchantSupporterId: order.supporterId,
      });
    }
  }

  private async handleSystemUpdateStepOrder(payload: { order: Order }) {
    const { order } = payload;
    this.orderProcessMap.set(order.id, order);

    this.handleEmitResponseOrder(order, events.actions.order.buy.systemUpdateStep);
    this.emitStatisticRelatedToOrder(order);
  }

  private async handleSystemUpdateAppealTimeoutOrder(payload: { order: Order }) {
    const { order } = payload;
    this.orderProcessMap.set(order.id, order);

    this.handleEmitResponseOrder(order, events.actions.order.buy.systemUpdateAppealTimeout);
    this.emitStatisticRelatedToOrder(order);
  }

  private async handleSystemCancelOrder(payload: { order: Order; post: Post }) {
    const { order } = payload;
    this.orderProcessMap.delete(order.id);
    this.orderBlacklistMap.delete(order.id);
    this.handleEmitResponseOrder(order, events.actions.order.buy.systemCancelOrder);
    this.emitStatisticRelatedToOrder(order);

    // Due to business, unlink supporter from order when fullfill.
    const notifications = [];
    if (order.appealId) {
      notifications.push(
        this.notificationService.createNotification({
          notificationCase: NOTIFICATION_TYPE.ORDER_CANCELLED_BY_SYSTEM,
          transactionRefId: order.refId,
          type: NotificationType.TRANSACTION,
          endUserId: order.userId,
        }),
        this.notificationService.createNotification({
          notificationCase: NOTIFICATION_TYPE.ORDER_CANCELLED_BY_SYSTEM,
          transactionRefId: order.refId,
          type: NotificationType.TRANSACTION,
          merchantId: order.merchantId,
        })
      );
    }
    if (order.supporterId) {
      notifications.push(
        this.notificationService.createNotification({
          notificationCase: NOTIFICATION_TYPE.ORDER_CANCELLED_BY_SYSTEM,
          transactionRefId: order.refId,
          type: NotificationType.TRANSACTION,
          merchantSupporterId: order.supporterId,
        })
      );
    }
    await Promise.allSettled(notifications);
  }

  private async handleSystemFinishOrder(payload: { order: Order }) {
    const { order } = payload;
    this.orderProcessMap.delete(order.id);
    this.orderBlacklistMap.delete(order.id);
    this.handleEmitResponseOrder(order, events.actions.order.buy.systemFinishOrder);
    this.emitStatisticRelatedToOrder(order);
  }

  private async processOrderCountdown() {
    const limit = pLimit(50);

    this.done = false;
    const waitActionOrders: Order[] = [];
    this.orderProcessMap.forEach((order: Order) => {
      if (moment(order.endedTime).add(env.mercy.timeout, 'second') < moment.utc() && order.hasBuyCountdownStep()) {
        waitActionOrders.push(order);
      }
    });
    if (waitActionOrders.length) {
      const waitActionOrderPromises = waitActionOrders.map((order) =>
        limit(async () => {
          let result: ServiceResult<Order>;
          if (
            this.orderBlacklistMap.has(order.id) &&
            this.orderService.isValidOrderStepMoveToAppeal(order.step, TradeType.BUY)
          ) {
            // If order is in blacklist, contact to admin
            await this.openAppealBuyOrderUseCase.openAppealBuyOrder(order.user, order.refId);
            this.orderBlacklistMap.delete(order.id);
            this.orderProcessMap.delete(order.id);
          }
          // Step 1: User do not send fiat => timeout go to step 2
          if (order.step === BUY_ORDER_STEPS.BUY_ORDER_CREATED_BY_USER) {
            result = await this.systemBuyOrderLifecycleService.updateAppealSendingFiat(order.id);
          }
          // Step 2: Merchant does not confirm received fiat => timeout go to step 5
          if (order.step === BUY_ORDER_STEPS.BUY_ORDER_CREATED_BY_USER_DEAL_TIME) {
            result = await this.systemBuyOrderLifecycleService.updateAppealReceiveFiat(order.id);
          }
          // Step 3: user sent fiat after 10p => timeout go to step 4
          if (order.step === BUY_ORDER_STEPS.BUY_NOTIFY_SENT_FIAT_BY_USER) {
            result = await this.systemBuyOrderLifecycleService.updateAppealConfirmingFiat(order.id);
          }
          // Step 4: Merchant does not confirm deal with User => timeout go to step 5
          if (order.step === BUY_ORDER_STEPS.BUY_NOTIFY_SENT_FIAT_BY_USER_DEAL_TIME) {
            result = await this.systemBuyOrderLifecycleService.updateAppealReceiveFiat(order.id);
          }
          // step 5: User does not request support from system => timeout cancel by system
          if (order.step === BUY_ORDER_STEPS.BUY_ENABLE_APPEAL_WHILE_CONFIRMING_FIAT_BY_MERCHANT) {
            result = await this.systemBuyOrderLifecycleService.cancelOrder(order.id);
          }
          // step 7: Merchant does not transfer crypto => timeout go to step 8
          if (order.step === BUY_ORDER_STEPS.BUY_CONFIRMED_FIAT_BY_MERCHANT) {
            result = await this.systemBuyOrderLifecycleService.updateAppealNotReceiveFiat(order.id);
          }
          if (result && result.data) {
            this.orderProcessMap.set(order.id, result.data);
          }
        })
      );
      await Promise.allSettled(waitActionOrderPromises);
    }
    this.done = true;
  }

  private emitOrder(rooms: string[] | string, payload: any, action: string) {
    this.socketFactory.emitToRoom(rooms, { ...payload, action, event: events.objects.order });
  }

  private async emitStatisticRelatedToOrder(order: Order) {
    const userStatistic = await this.statisticService.getUserStatistic(order.user.id);
    const merchantStatistic = await this.statisticService.getMerchantStatistic(order.merchant.id);
    this.socketFactory.emitToRoom(order.user.walletAddress, {
      ...userStatistic,
      event: events.objects.user,
      action: events.actions.user.statistic,
    });
    const cancelOrderAppeal = OrderStatisticUtil.isCancelOrderByAppeal(order);
    this.socketFactory.emitToRoom(
      this.operationService.isUserBlocked(order.merchant)
        ? order.merchant?.merchantManager?.walletAddress
        : order.merchant.walletAddress,
      {
        ...merchantStatistic,
        event: events.objects.user,
        action: events.actions.user.statistic,
        cancelOrderAppeal,
      }
    );
  }

  private getWorkerOpts() {
    return {
      ...this.bullConfig,
      lockDuration: 90000,
      concurrency: 200,
    };
  }
}
