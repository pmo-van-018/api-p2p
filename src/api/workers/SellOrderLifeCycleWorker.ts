import { Job, QueueBaseOptions } from 'bullmq';
import { plainToInstance } from 'class-transformer';
import pLimit from 'p-limit';
import moment from 'moment';
import { Observable, Subject, of } from 'rxjs';
import { Service } from 'typedi';

import { QUEUE_NAME } from '@api/common/models/P2PConstant';
import { events } from '@api/subscribers/events';
import { env } from '@base/env';
import { WorkerConfig } from './WorkerConfig';
import { WorkerInterface } from './WorkerInterface';

import { SocketFactory } from '@api/sockets/SocketFactory';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { formatCrypto } from '@base/utils/amount.utils';

import { ServiceResult } from '@api/infrastructure/helpers/ServiceResult';
import { SharedNotificationService } from '@api/notification/services/SharedNotificationService';
import { SharedOrderService } from '@api/order/services/order/SharedOrderService';
import { SystemSellOrderLifecycleService } from '@api/order/services/order/sell';
import { Post } from '@api/post/models/Post';
import { BullMQService } from '@base/job-queue/BullMQ/BullMQService';
import { NOTIFICATION_TYPE, NotificationType, OperationType, TradeType } from '../common/models';
import { CryptoTransaction, TransactionStatus } from '../order/models/CryptoTransaction';
import { Order, SELL_ORDER_STEP } from '../order/models/Order';

import Timeout = NodeJS.Timeout;
import { SharedProfileService } from '@api/profile/services/SharedProfileService';
import { EventOperationOrderInfoResponse } from '@api/order/responses/EventSubscriber/Operation';
import { EventUserOrderInfoResponse } from '@api/order/responses/EventSubscriber/User';
import { closeChatRoom } from '@base/utils/chat.utils';
import { OpenAppealSellOrderUseCase } from '@api/appeal/usecase/OpenAppealSellOrderUseCase';
import { SharedStatisticService } from '@api/statistic/services/SharedStatisticService';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { TRANSACTION_DEFAULT_OPTIONS } from '@api/common/constants/TransactionConstant';

@Service()
export default class SellOrderLifeCycleWorker implements WorkerInterface {
  private subject: Subject<any>;
  private interval: Timeout | number;
  private done: boolean;
  private orderProcessMap: Map<string, Order> = new Map<string, Order>();
  private orderBlacklistMap: Set<string> = new Set<string>();

  private readonly QUEUE_NAME = QUEUE_NAME.SELL_ORDER;

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
    private socketFactory: SocketFactory,
    private operationManagementService: SharedProfileService,
    private statisticService: SharedStatisticService,
    private orderService: SharedOrderService,
    private systemSellOrderLifecycleService: SystemSellOrderLifecycleService,
    private notificationService: SharedNotificationService,
    private openAppealSellOrderUseCase: OpenAppealSellOrderUseCase
  ) {
    this._bullMQService = new BullMQService();
    this._bullMQService.createWorker(this.QUEUE_NAME, this.getWorkerProcessor(), this.getWorkerOpts());
  }

  public async start(): Promise<Observable<any>> {
    this.log.info('+++ Start SellOrderLifeCycleWorker +++');
    if (this.subject) {
      return this.subject;
    }

    this.subject = new Subject<any>();

    const orders = await this.orderService.getCountdownSellOrderList();
    if (orders !== null) {
      orders.map((order) => this.orderProcessMap.set(order.id, order));
      this.log.info(`Total orders processing: ${this.orderProcessMap.size}`);

      // Get order in blacklist
      const orderBlacklist = await this.orderService.getSellOrdersByBlackList();
      orderBlacklist.map((order) => this.orderBlacklistMap.add(order.id));
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
    this.log.info('+++ Stopping SellOrderLifeCycleWorker +++');

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
      const cryptoTransactionRequest: CryptoTransaction = job.data['cryptoTransaction'];
      const retryTime: number = job.data['retryTime'];
      const orderId: string = job.data['orderId'];
      switch (job.name) {
        case events.actions.order.sell.merchantConfirmSentPayment:
          await this.handleMerchantConfirmSentPayment({ order: plainToInstance(Order, orderRequest) });
          break;
        case events.actions.order.sell.merchantCreatePaymentTicket:
          await this.handleMerchantCreatePaymentTicket({ order: plainToInstance(Order, orderRequest) });
          break;
        case events.actions.order.sell.merchantPickPaymentTicket:
          await this.handlePickPaymentTicket({ order: plainToInstance(Order, orderRequest) });
          break;
        case events.actions.order.sell.merchantCancelPaymentTicket:
          await this.handleCancelPaymentTicket({ order: plainToInstance(Order, orderRequest) });
          break;
        case events.actions.order.sell.userCreateOrder:
          await this.handleUserCreateOrder({ order: plainToInstance(Order, orderRequest) });
          break;
        case events.actions.order.sell.userConfirmReceived:
          await this.handleUserConfirmReceived({ order: plainToInstance(Order, orderRequest) });
          break;
        case events.actions.order.sell.userCancelOrder:
          await this.handleUserCancelOrder({ order: plainToInstance(Order, orderRequest) });
          break;
        case events.actions.order.sell.userSubmitTransaction:
          await this.handleUserSubmitTransaction({ order: plainToInstance(Order, orderRequest) });
          break;
        case events.actions.order.sell.systemUpdateTransactionStatus:
          await this.handleSystemUpdateTransactionStatusOrder({
            order: plainToInstance(Order, orderRequest),
            cryptoTransaction: plainToInstance(CryptoTransaction, cryptoTransactionRequest),
            retryTime,
          });
          break;
        case events.actions.order.sell.systemUpdateStepOrder:
          await this.handleSystemUpdateStepOrder({ order: plainToInstance(Order, orderRequest) });
          break;
        case events.actions.order.sell.systemCancelOrder:
          await this.handleSystemCancelOrder({
            order: plainToInstance(Order, orderRequest),
            post: plainToInstance(Post, postRequest),
          });
          break;
        case events.actions.order.sell.systemFinishOrder:
          await this.handleSystemFinishOrder({ order: plainToInstance(Order, orderRequest) });
          break;
        case events.actions.order.sell.operatorCreateChatRoom:
          await this.handleOperatorCreateChatRoomOrderSell(plainToInstance(Order, orderRequest));
          break;
        case events.actions.order.sell.userRequestTransactionConfirmation:
          await this.handleUserRequestTransactionConfirmation(plainToInstance(Order, orderRequest));
          break;
        case events.actions.order.sell.cancelOrderByAdminSupporter:
          await this.handleCancelOrderByAdminSupporter(plainToInstance(Order, orderRequest));
          break;
        case events.actions.order.sell.rpcUnknowError:
          await this.handleTransactionUnknownError(plainToInstance(Order, orderRequest));
          break;
        case events.actions.order.sell.adminAddToBacklist:
          await this.handleOrderInBlacklist(orderId);
          break;
        default:
          break;
      }
    };
  }

  private async handleOperatorCreateChatRoomOrderSell(order: Order) {
    this.handleEmitResponseOrder(order, events.actions.order.sell.operatorCreateChatRoom);
  }

  private handleEmitResponseOrder(order: Order, event: string, retryTime?: number) {
    const operationOrderResponse = new EventOperationOrderInfoResponse(order);
    const userOrderResponse = new EventUserOrderInfoResponse(order, retryTime);

    this.emitOrder(order.user.walletAddress, userOrderResponse, event);
    this.emitOrder(
      this.operationManagementService.isUserBlocked(order.merchant)
        ? order.merchant?.merchantManager?.walletAddress
        : order.merchant.walletAddress,
      operationOrderResponse,
      event
    );
  }

  private async handleMerchantConfirmSentPayment(payload: { order: Order }) {
    const { order } = payload;
    this.orderProcessMap.set(order.id, order);

    this.handleEmitResponseOrder(order, events.actions.order.sell.merchantConfirmSentPayment);
    this.emitStatisticRelatedToOrder(order);
  }

  private async handleMerchantCreatePaymentTicket(payload: { order: Order }) {
    const { order } = payload;
    this.handleEmitResponseOrder(order, events.actions.order.sell.merchantCreatePaymentTicket);
  }

  private async handlePickPaymentTicket(payload: { order: Order }) {
    const { order } = payload;
    this.handleEmitResponseOrder(order, events.actions.order.sell.merchantPickPaymentTicket);
  }

  public async handleCancelPaymentTicket(payload: { order: Order }) {
    const { order } = payload;
    this.handleEmitResponseOrder(order, events.actions.order.sell.merchantCancelPaymentTicket);
  }

  private async handleUserCreateOrder(payload: { order: Order }) {
    const { order } = payload;
    this.orderProcessMap.set(order.id, order);

    this.handleEmitResponseOrder(order, events.actions.order.sell.userCreateOrder);
    this.emitStatisticRelatedToOrder(order);
    await this.notificationService.createNotification({
      notificationCase: NOTIFICATION_TYPE.SELL_ORDER_CREATED_BY_USER,
      transactionId: order.id,
      transactionRefId: order.refId,
      transactionType: order.type,
      amount: formatCrypto(order.amount),
      username: order.user.nickName || order.user.walletAddress,
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

  private async handleUserConfirmReceived(payload: { order: Order }) {
    this.log.info(`Handle user confirm received order with id: ${payload.order.id}`);
    const { order } = payload;
    this.orderProcessMap.delete(order.id);
    this.handleEmitResponseOrder(order, events.actions.order.sell.userConfirmReceived);
    this.emitStatisticRelatedToOrder(order);
    // Due to business, remove supporter from order when fullfill.
    if (order.supporterId) {
      await this.notificationService.createNotification({
        notificationCase: NOTIFICATION_TYPE.ADMIN_NOTIFY_MERCHANT_SUPPORTER_ORDER_IS_COMPLETED,
        orderIds: [order.refId],
        type: NotificationType.TRANSACTION,
        merchantSupporterId: order.supporterId,
      });
    }
  }

  private async handleUserCancelOrder(payload: { order: Order }) {
    const { order } = payload;
    this.orderProcessMap.delete(order.id);

    this.handleEmitResponseOrder(order, events.actions.order.sell.userCancelOrder);
    this.emitStatisticRelatedToOrder(order);
    if (order.roomId) {
      try {
        await closeChatRoom({ roomId: order.roomId });
      } catch (error) {
        this.log.error(`Error when close chat room: ${order.roomId} - ${error}`);
      }
    }
  }

  private async handleUserSubmitTransaction(payload: { order: Order }) {
    this.log.info(`Handle user submit transaction with id: ${payload.order.id}`);
    const { order } = payload;
    this.orderProcessMap.set(order.id, order);

    this.handleEmitResponseOrder(order, events.actions.order.sell.userSubmitTransaction);
    this.emitStatisticRelatedToOrder(order);
  }

  private async handleSystemUpdateTransactionStatusOrder(payload: {
    order: Order;
    cryptoTransaction: CryptoTransaction;
    retryTime?: number;
  }) {
    this.log.info(`Handle system update transaction status order with id: ${payload.order.id}`);
    const { order, cryptoTransaction, retryTime } = payload;
    this.orderProcessMap.set(order.id, order);

    this.handleEmitResponseOrder(order, events.actions.order.sell.systemUpdateTransactionStatus, retryTime);
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

    this.handleEmitResponseOrder(order, events.actions.order.sell.systemUpdateStepOrder);
    this.emitStatisticRelatedToOrder(order);
  }

  private async handleSystemCancelOrder(payload: { order: Order; post: Post }) {
    this.log.info(`Handle system cancel order with id: ${payload.order.id}`);
    const { order } = payload;
    this.orderProcessMap.delete(order.id);
    this.orderBlacklistMap.delete(order.id);
    this.handleEmitResponseOrder(order, events.actions.order.sell.systemCancelOrder);
    this.emitStatisticRelatedToOrder(order);
    if (order.supporterId) {
      await this.notificationService.createNotification({
        notificationCase: NOTIFICATION_TYPE.ADMIN_NOTIFY_MERCHANT_SUPPORTER_ORDER_IS_CANCELED,
        orderIds: [order.refId],
        type: NotificationType.TRANSACTION,
        merchantSupporterId: order.supporterId,
      });
    }
  }

  private async handleSystemFinishOrder(payload: { order: Order }) {
    this.log.info(`Handle system finish order with id: ${payload.order.id}`);
    const { order } = payload;

    this.handleEmitResponseOrder(order, events.actions.order.sell.systemFinishOrder);
    this.emitStatisticRelatedToOrder(order);
  }

  private async handleTransactionUnknownError(order: Order ) {
    this.log.info(`Handle TransactionUnknownError with order id: ${order?.id}`);
    this.handleEmitResponseOrder(order, events.actions.order.sell.rpcUnknowError);
  }

  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  private async handleUserRequestTransactionConfirmation(order: Order) {
    this.log.info(`Handle handleUserRequestTransactionConfirmation with order id: ${order?.id}`);
    const operationOrderResponse = new EventOperationOrderInfoResponse(order);
    this.emitOrder(
      this.operationManagementService.isUserBlocked(order.merchant)
        ? order.merchant?.merchantManager?.walletAddress
        : order.merchant.walletAddress,
      operationOrderResponse,
      events.actions.order.sell.userRequestTransactionConfirmation
    );
    const adminSupporters = await this.operationManagementService.findAllActiveOperations([OperationType.ADMIN_SUPPORTER]);
    const notificationPromises = [];
    adminSupporters.map((adminSupporter) => {
      notificationPromises.push(this.notificationService.createNotification({
        notificationCase: NOTIFICATION_TYPE.SELL_ORDER_HAS_TRANSACTION_UNKNOWN_ERROR_TO_ADMIN_SUPPORTER,
        transactionRefId: order.refId,
        amount: order.amount,
        assetNetworks: `${order.asset?.name} ${order.asset?.network}`,
        type: NotificationType.TRANSACTION,
        adminId: adminSupporter.id,
        username: order.user.nickName,
        walletAddress: adminSupporter.walletAddress,
      }))
    })
    notificationPromises.push(this.notificationService.createNotification({
      notificationCase: NOTIFICATION_TYPE.SELL_ORDER_HAS_TRANSACTION_UNKNOWN_ERROR_TO_OPERATOR,
      transactionRefId: order.refId,
      amount: order.amount,
      assetNetworks: `${order.asset?.name} ${order.asset?.network}`,
      type: NotificationType.TRANSACTION,
      merchantId: order.merchant.id,
      username: order.user.nickName,
      walletAddress: order.merchant.walletAddress,
    }))
    await Promise.allSettled(notificationPromises);
  }
  
  @Transactional(TRANSACTION_DEFAULT_OPTIONS)
  private async handleCancelOrderByAdminSupporter(order: Order) {
    this.log.info(`Handle handleCancelOrderByAdminSupporter with order id: ${order?.id}`);
    const notificationPromises = [];
    notificationPromises.push(
      this.notificationService.createNotification({
        notificationCase: NOTIFICATION_TYPE.ORDER_CANCELLED_BY_SYSTEM,
        transactionRefId: order.refId,
        type: NotificationType.TRANSACTION,
        endUserId: order.userId,
        walletAddress: order.user.walletAddress
      }),
      this.notificationService.createNotification({
        notificationCase: NOTIFICATION_TYPE.ORDER_CANCELLED_BY_SYSTEM,
        transactionRefId: order.refId,
        type: NotificationType.TRANSACTION,
        merchantId: order.merchantId,
        walletAddress: order.merchant.walletAddress
      })
    )
    await Promise.allSettled(notificationPromises);
  }

  private async processOrderCountdown() {
    const limit = pLimit(50);

    this.done = false;
    const waitActionOrders: Order[] = [];
    this.orderProcessMap.forEach((order: Order) => {
      if (moment(order.endedTime).add(env.mercy.timeout, 'second') < moment.utc() && order.hasSellCountdownStep()) {
        waitActionOrders.push(order);
      }
    });
    if (waitActionOrders.length) {
      const waitActionOrderPromises = waitActionOrders.map((order) =>
        limit(async () => {
          try {
            let result: ServiceResult<Order>;
            if (
              this.orderBlacklistMap.has(order.id) &&
              this.orderService.isValidOrderStepMoveToAppeal(order.step, TradeType.SELL)
            ) {
              // If order is in blacklist, cancel order
              await this.openAppealSellOrderUseCase.openAppealSellOrder(order.user, order.refId);
              this.orderBlacklistMap.delete(order.id);
              this.orderProcessMap.delete(order.id);
            }
            // Step 1: user do not confirm send crypto => step 10, cancel order by system
            if (order.step === SELL_ORDER_STEP.SELL_ORDER_CREATED_BY_USER) {
              result = await this.systemSellOrderLifecycleService.cancelOrder(order.id);
            }
            // Step 3: send crypto failed => step 2, if sent failed 3, end time => step 10
            if (order.step === SELL_ORDER_STEP.SELL_SENDING_CRYPTO_FAILED) {
              result = await this.systemSellOrderLifecycleService.updateSendingCrypto(order.id);
            }
            // step 4: sent success crypto, waiting for timeout => step 5: enable to appeal
            if (order.step === SELL_ORDER_STEP.SELL_SENDING_CRYPTO_SUCCESS) {
              result = await this.systemSellOrderLifecycleService.updateNotSendingFiat(order.id);
            }
            // step 6: sent fiat by merchant, waiting for timeout => step 7: enable CSKH
            if (order.step === SELL_ORDER_STEP.SELL_NOTIFY_SENT_FIAT_BY_MERCHANT_DEAL_TIME) {
              result = await this.systemSellOrderLifecycleService.updateEnableAppealWithAdminNotSendingFiat(order.id);
            }
            // step 7: sent fiat by merchant + enable CSKH, waiting for timeout => step 9: success
            if (order.step === SELL_ORDER_STEP.SELL_ENABLE_APPEAL_NOTIFY_SENT_FIAT_BY_MERCHANT) {
              result = await this.systemSellOrderLifecycleService.updateConfirmedReceivedFiat(order.id);
            }
            if (result && result.data) {
              this.orderProcessMap.set(order.id, result.data);
            }
          } catch (e) {
            console.error(e);
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
    this.socketFactory.emitToRoom(
      this.operationManagementService.isUserBlocked(order.merchant)
        ? order.merchant?.merchantManager?.walletAddress
        : order.merchant.walletAddress,
      {
        ...merchantStatistic,
        event: events.objects.user,
        action: events.actions.user.statistic,
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
