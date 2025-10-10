import { Job, QueueBaseOptions } from 'bullmq';
import { plainToInstance } from 'class-transformer';
import { Observable, Subject, of } from 'rxjs';
import { Service } from 'typedi';

import { NOTIFICATION_TYPE, NotificationType, TradeType, OperationType } from '@api/common/models';
import { QUEUE_NAME, SUB_DOMAIN_OPERATIONS_LINK } from '@api/common/models/P2PConstant';
import { Order } from '@api/order/models/Order';
import { events } from '@api/subscribers/events';
import { env } from '@base/env';
import { WorkerInterface } from './WorkerInterface';

import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { formatCrypto } from '@base/utils/amount.utils';
import { BUY_ORDER_GROUPS, OrderStatisticUtil, SELL_ORDER_GROUPS } from '@base/utils/orderStatistic';

import { SharedNotificationService } from '@api/notification/services/SharedNotificationService';
import { SharedOrderService } from '@api/order/services/order/SharedOrderService';
import { SocketFactory } from '@api/sockets/SocketFactory';
import { BullMQService } from '@base/job-queue/BullMQ/BullMQService';
import { EventOperationOrderInfoResponse } from '@api/order/responses/EventSubscriber/Operation';
import { OrderInfoBaseResponse } from '@api/order/responses/Orders/User/OrderInfoBaseResponse';
import { Operation } from '@api/profile/models/Operation';
import { User } from '@api/profile/models/User';
import { Appeal } from '@api/appeal/models/Appeal';
import { AppealResponse } from '@api/appeal/responses/AppealResponse';
import { SharedProfileService } from '@api/profile/services/SharedProfileService';

@Service()
export default class AppealOrderWorker implements WorkerInterface {
  private subject: Subject<any>;

  private readonly QUEUE_NAME = QUEUE_NAME.APPEAL_ORDER;
  private readonly subOperationsLink = SUB_DOMAIN_OPERATIONS_LINK;
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
    private orderService: SharedOrderService,
    private socketFactory: SocketFactory,
    private notificationService: SharedNotificationService,
    private operationManagementService: SharedProfileService
  ) {
    this._bullMQService = new BullMQService();
    this._bullMQService.createWorker(this.QUEUE_NAME, this.getWorkerProcessor(), this.getWorkerOpts());
  }

  public async start(): Promise<Observable<any>> {
    this.log.info('+++ Start SaveVolumeDbWorker +++');
    return this.subject;
  }

  public async stop(): Promise<Observable<any>> {
    this.log.info('+++ Stopping AppealOrderWorker +++');

    return this.subject || of();
  }

  private getWorkerProcessor() {
    return async (job: Job) => {

      const orderRequest: Order = job.data['order'];
      const appealId = job.data['appealId'];
      const adminId = job.data['adminId'];
      const orderId = job.data['orderId'];
      const supporters: Operation[] = job.data['supporters'];
      const userName = job.data['userName'];
      const supportRequestId = job.data['supportRequestId'];

      switch (job.name) {
        case events.actions.appeal.supporterReceiveAppealOrder:
          await this.handleSupporterReceiveAppealOrder(job.data);
          break;
        case events.actions.appeal.supporterResolveAppealOrder:
          await this.handleSupporterResolveAppealOrder(job.data);
          break;
        case events.actions.appeal.userCreateAppeal:
          await this.handleUserCreateAppeal(plainToInstance(Order, job.data));
          break;
        case events.actions.appeal.extraTimeBuyAppeal:
          await this.handleExtendExtraTimeBuyAppeal(plainToInstance(Appeal, job.data));
          break;
        case events.actions.appeal.userBuyAppeal:
          await this.handleUserAppealToMerchantBuyOrder({ order: plainToInstance(Order, orderRequest) });
          break;
        case events.actions.appeal.closeAppealInBuy:
          await this.handleCloseAppealBuyOrder({ order: plainToInstance(Order, orderRequest) });
          break;
        case events.actions.appeal.resultBuyAppealUserWin:
          await this.handleUserWinAppealBuyOrder({ order: plainToInstance(Order, orderRequest) });
          break;
        case events.actions.appeal.closeBuyAppealNotEvident:
          await this.handleCloseBuyAppealWithoutEvident({ order: plainToInstance(Order, orderRequest) });
          break;
        case events.actions.appeal.reopenBuyAppealUserWin:
          await this.handleReopenBuyAppealUserWin({ order: plainToInstance(Order, orderRequest) });
          break;
        case events.actions.appeal.resultBuyAppealMerchantWin:
          await this.handleMerchantWinBuyAppeal({ order: plainToInstance(Order, orderRequest) });
          break;
        case events.actions.appeal.userSellAppeal:
          await this.handleUserCreateSellAppeal({ order: plainToInstance(Order, orderRequest) });
          break;
        case events.actions.appeal.extraTimeSellAppeal:
          await this.handleExtendExtraTimeSellAppeal(plainToInstance(Appeal, job.data));
          break;
        case events.actions.appeal.closeSellAppeal:
          await this.handleCloseAppealSellOrder({ order: plainToInstance(Order, orderRequest) });
          break;
        case events.actions.appeal.resultSellAppealMerchantWin:
          await this.handleMerchantWinSellAppeal({ order: plainToInstance(Order, orderRequest) });
          break;
        case events.actions.appeal.resultSellAppealUserWin:
          await this.handleUserWinAppealSellOrder({ order: plainToInstance(Order, orderRequest) });
          break;
        case events.actions.appeal.closeAppeal:
          await this.handleCloseAppeal(appealId);
          break;
        case events.actions.appeal.adminSupporterPickAppeal:
          await this.handleAdminSupporterPickAppeal(job.data);
          break;
        case events.actions.appeal.adminCancelAppealSession:
          await this.handleCancelAppealSession({ adminId, appealId, orderId });
          break;
        case events.actions.appeal.userAgreeToMerchant:
            await this.handleUserAgreeToMerchant({
              order: plainToInstance(Order, orderRequest),
              supporters: plainToInstance(Operation, supporters),
          });
          break;
        case events.actions.supportRequest.createNewSupportRequest:
            await this.handleCreateNewSupportRequest(userName);
          break;
        case events.actions.supportRequest.supportRequestPicked:
            await this.handlePickSupportRequest(supportRequestId);
          break;
        case events.actions.supportRequest.resolvedSupportRequest:
            await this.resolvedSupportRequest(job.data);
          break;
        default:
          break;
      }
    };
  }

  private async handleSupporterReceiveAppealOrder(payload: { orderId: string }) {
    const order = await this.orderService.getFullInfoById(payload.orderId);
    if (!order) {
      return;
    }
    // send socket to client
    const orderResponse = new EventOperationOrderInfoResponse(order);
    this.socketFactory.emitToRoom(order.supporter.walletAddress, {
      order: {
        ...orderResponse,
      },
      supporter: {
        id: order.supporter.id,
        walletAddress: order.supporter.walletAddress,
      },
      event: events.actions.appeal.supporterReceiveAppealOrder,
    });
    const orderGroups = order.type === TradeType.BUY ? BUY_ORDER_GROUPS : SELL_ORDER_GROUPS;
    const status = OrderStatisticUtil.getOrderGroupByStep(orderGroups[OperationType.MERCHANT_OPERATOR], order.step);
    // push notification to merchant operator to notify that already supporter handled it
    await this.notificationService.createNotification({
      notificationCase: NOTIFICATION_TYPE.SUPPORTER_RECEIVE_APPEAL_ORDER,
      orderIds: [order.refId],
      username: order.supporter.nickName,
      type: NotificationType.TRANSACTION,
      merchantId: this.operationManagementService.isUserBlocked(order.merchant)
        ? order.merchant?.merchantManager?.id
        : order.merchant?.id,
      link: this.operationManagementService.isUserBlocked(order.merchant)
        ? `${this.subOperationsLink}/merchant-manager/staffs/${order.merchantId}/orders?status=${this.convertStatusToQueryLink(status)}`
        : `${this.subOperationsLink}/merchant/orders?status=${this.convertStatusToQueryLink(status)}`,
    });
  }

  private async handleSupporterResolveAppealOrder(payload: { orderId: string }) {
    const order = await this.orderService.getFullInfoById(payload.orderId);
    if (!order) {
      return;
    }
    // send socket to client
    this.socketFactory.emitToRoom([order.supporter.walletAddress, order.merchant.walletAddress], {
      order: payload,
      action: events.actions.appeal.supporterResolveAppealOrder,
    });
  }

  private async handleUserCreateAppeal(order: Order) {
    const admins = await this.operationManagementService.findAllAdmins();
    const rooms = admins.map((admin) => admin.walletAddress);
    this.socketFactory.emitToRoom([...rooms, order.user.walletAddress], {
      appeal: order.appeal,
      event: events.objects.appeal,
      action: events.actions.appeal.userCreateAppeal,
    });
    await Promise.all(
      admins.map((admin: Operation) => {
        this.notificationService.createNotification({
          notificationCase: order.type === TradeType.BUY ? NOTIFICATION_TYPE.BUY_ORDER_USER_APPEAL_TO_ADMIN : NOTIFICATION_TYPE.SELL_ORDER_USER_APPEAL_TO_ADMIN,
          transactionId: order.id,
          transactionRefId: order.refId,
          appealId: order.appeal.id,
          transactionType: order.type,
          username: order.user.nickName,
          amount: formatCrypto(order.amount),
          currency: order.asset.name,
          type: NotificationType.TRANSACTION,
          walletAddress: admin.walletAddress,
          adminId: admin.id,
          link: admin.type === OperationType.SUPER_ADMIN ? `/appeal-detail?appealId=${order.appeal.id}` : '/appeals',
        });
      })
    );
  }

  private async handleExtendExtraTimeBuyAppeal(appeal: Appeal) {
    const { order } = appeal;
    await this.notificationService.createNotification({
      notificationCase: NOTIFICATION_TYPE.BUY_ORDER_DEAL_TIME,
      transactionId: order.id,
      transactionRefId: order.refId,
      transactionType: order.type,
      username: order.user.nickName,
      amount: formatCrypto(order.amount),
      currency: order.asset.name,
      datetime: appeal.completedAt,
      type: NotificationType.TRANSACTION,
      walletAddress: order.user.walletAddress,
      endUserId: order.user.id,
    });

    await this.notificationService.createNotification({
      notificationCase: NOTIFICATION_TYPE.BUY_ORDER_DEAL_TIME,
      transactionId: order.id,
      transactionRefId: order.refId,
      transactionType: order.type,
      username: order.user.nickName,
      currency: order.asset.name,
      datetime: appeal.completedAt,
      type: NotificationType.TRANSACTION,
      walletAddress: order.merchant.walletAddress,
      amount: formatCrypto(order.amount),
      link: this.operationManagementService.isUserBlocked(order.merchant)
        ? `${this.subOperationsLink}/merchant-manager/staffs/${order.merchantId}/orders?status=appeal`
        : `${this.subOperationsLink}/merchant/orders?status=appeal`,
      ...(!this.operationManagementService.isUserBlocked(order.merchant) && { merchantId: order.merchantId }),
      ...(this.operationManagementService.isUserBlocked(order.merchant) && { merchantManagerId: order.merchant?.merchantManagerId }),
    });
    order.appeal = appeal;
    const orderResponse = new OrderInfoBaseResponse(order);
    const room = [
      order.user.walletAddress,
      this.operationManagementService.isUserBlocked(order.merchant) ? order.merchant.merchantManager.walletAddress : order.merchant.walletAddress,
    ];
    if (order.supporter) {
      room.push(order.supporter.walletAddress);
    } else {
      const supporters = await this.operationManagementService.findAllSupportersByManagerId(order.merchant.merchantManagerId);
      const supporterWallets = supporters.map(e => e.walletAddress);
      room.push(...supporterWallets);
    }
    this.socketFactory.emitToRoom(room, {
      order: orderResponse,
      event: events.objects.appeal,
      action: events.actions.appeal.extraTimeBuyAppeal,
    });
  }

  private async handleUserAppealToMerchantBuyOrder(payload: { order: Order }) {
    const { order } = payload;
    await this.notificationService.createNotification({
      notificationCase: NOTIFICATION_TYPE.BUY_ORDER_USER_APPEAL_TO_MERCHANT,
      transactionId: order.id,
      transactionRefId: order.refId,
      transactionType: order.type,
      currency: order.asset.name,
      type: NotificationType.TRANSACTION,
      walletAddress: order.merchant.walletAddress,
      username: order.user.nickName,
      datetime: order.appeal.createdAt,
      amount: formatCrypto(order.amount),
      link: this.operationManagementService.isUserBlocked(order.merchant)
        ? `${this.subOperationsLink}/merchant-manager/staffs/${order.merchantId}/orders?status=appeal`
        : `${this.subOperationsLink}/merchant/orders?status=appeal`,
      ...(!this.operationManagementService.isUserBlocked(order.merchant) && { merchantId: order.merchantId }),
      ...(this.operationManagementService.isUserBlocked(order.merchant) && { merchantManagerId: order.merchant?.merchantManagerId }),
    });
  }

  private async handleUserAgreeToMerchant(payload: { order: Order, supporters: Operation[] }) {
    const { order, supporters } = payload;
    supporters.push(order.merchant);
    const operatorName = order?.merchant.nickName;
    await Promise.allSettled(supporters.map((op) => {
      return this.notificationService.createNotification({
        notificationCase: this.getNotificationCaseByOrder(order, op),
        transactionRefId: order.refId,
        currency: order.asset.name,
        type: NotificationType.TRANSACTION,
        walletAddress: op.walletAddress,
        username: order.user.nickName,
        operatorName,
        amount: formatCrypto(order.amount),
        ...op.type === OperationType.MERCHANT_SUPPORTER ? {merchantSupporterId: op.id} : {merchantId: op.id},
      });
    }));
  }

  private async handleCloseAppealBuyOrder(payload: { order: Order }) {
    const { order } = payload;
    // Due to business, unlink supporter from order when fullfill.
    if (order.supporterId) {
      this.notificationService.createNotification({
        notificationCase: NOTIFICATION_TYPE.ADMIN_NOTIFY_MERCHANT_SUPPORTER_ORDER_IS_CANCELED,
        orderIds: [order.refId],
        type: NotificationType.TRANSACTION,
        merchantSupporterId: order.supporterId,
      });
    }
    await this.notificationService.createNotification({
      notificationCase: NOTIFICATION_TYPE.BUY_ORDER_CLOSE_APPEAL_MERCHANT_REFUNDED_TO_USER,
      transactionId: order.id,
      transactionRefId: order.refId,
      transactionType: order.type,
      amount: formatCrypto(order.amount),
      currency: order.asset.name,
      type: NotificationType.TRANSACTION,
      walletAddress: order.user.walletAddress,
      endUserId: order.user.id,
      username: order.merchant.merchantManager.nickName,
      datetime: order.appeal.createdAt,
    });
    await this.notificationService.createNotification({
      notificationCase: NOTIFICATION_TYPE.BUY_ORDER_CLOSE_APPEAL_MERCHANT_REFUNDED_TO_MERCHANT,
      transactionId: order.id,
      transactionRefId: order.refId,
      transactionType: order.type,
      currency: order.asset.name,
      type: NotificationType.TRANSACTION,
      walletAddress: order.merchant.walletAddress,
      amount: formatCrypto(order.amount),
      link: this.operationManagementService.isUserBlocked(order.merchant) ? '' : `${this.subOperationsLink}/merchant/orders?status=cancelled`,
      ...(!this.operationManagementService.isUserBlocked(order.merchant) && { merchantId: order.merchantId }),
      ...(this.operationManagementService.isUserBlocked(order.merchant) && { merchantManagerId: order.merchant?.merchantManagerId }),
      username: order.user.nickName,
      datetime: order.appeal.createdAt,
    });
  }

  private async handleUserWinAppealBuyOrder(payload: { order: Order }) {
    const { order } = payload;
    // Due to business, unlink supporter from order when fullfill.
    if (order.supporterId) {
      this.notificationService.createNotification({
        notificationCase: NOTIFICATION_TYPE.ADMIN_NOTIFY_MERCHANT_SUPPORTER_ORDER_IS_CANCELED,
        orderIds: [order.refId],
        type: NotificationType.TRANSACTION,
        merchantSupporterId: order.supporterId,
      });
    }
    await this.notificationService.createNotification({
      notificationCase: NOTIFICATION_TYPE.BUY_ORDER_RESULT_APPEAL_USER_WIN_CANCEL_BUY_ORDER_TO_USER,
      transactionId: order.id,
      transactionRefId: order.refId,
      transactionType: order.type,
      amount: formatCrypto(order.amount),
      currency: order.asset.name,
      type: NotificationType.TRANSACTION,
      walletAddress: order.user.walletAddress,
      endUserId: order.user.id,
      username: order.merchant.nickName,
      datetime: order.appeal.createdAt,
    });
    await this.notificationService.createNotification({
      notificationCase: NOTIFICATION_TYPE.BUY_ORDER_RESULT_APPEAL_USER_WIN_CANCEL_BUY_ORDER_TO_MERCHANT,
      transactionId: order.id,
      transactionRefId: order.refId,
      transactionType: order.type,
      currency: order.asset.name,
      type: NotificationType.TRANSACTION,
      walletAddress: order.merchant.walletAddress,
      amount: formatCrypto(order.amount),
      link: this.operationManagementService.isUserBlocked(order.merchant)
        ? `${this.subOperationsLink}/merchant-manager/staffs/${order.merchantId}/orders?status=cancelled`
        : `${this.subOperationsLink}/merchant/orders?status=cancelled`,
      ...(!this.operationManagementService.isUserBlocked(order.merchant) && { merchantId: order.merchantId }),
      ...(this.operationManagementService.isUserBlocked(order.merchant) && { merchantManagerId: order.merchant?.merchantManagerId }),
      username: order.user.nickName,
      datetime: order.appeal.createdAt,
    });
  }

  private async handleCloseBuyAppealWithoutEvident(payload: { order: Order }) {
    const { order } = payload;
    // Due to business, unlink supporter from order when fullfill.
    if (order.supporterId) {
      await this.notificationService.createNotification({
        notificationCase: NOTIFICATION_TYPE.ADMIN_NOTIFY_MERCHANT_SUPPORTER_ORDER_IS_CANCELED,
        orderIds: [order.refId],
        type: NotificationType.TRANSACTION,
        merchantSupporterId: order.supporterId,
      });
    }
    await this.notificationService.createNotification({
      notificationCase: NOTIFICATION_TYPE.BUY_ORDER_CLOSE_APPEAL_NOT_COMPLETE_TO_USER,
      transactionId: order.id,
      transactionRefId: order.refId,
      transactionType: order.type,
      amount: formatCrypto(order.amount),
      currency: order.asset.name,
      type: NotificationType.TRANSACTION,
      walletAddress: order.user.walletAddress,
      endUserId: order.user.id,
      username: order.merchant.merchantManager.nickName,
      datetime: order.appeal.createdAt,
    });
    await this.notificationService.createNotification({
      notificationCase: NOTIFICATION_TYPE.BUY_ORDER_CLOSE_APPEAL_NOT_COMPLETE_TO_MERCHANT,
      transactionId: order.id,
      transactionRefId: order.refId,
      transactionType: order.type,
      currency: order.asset.name,
      type: NotificationType.TRANSACTION,
      walletAddress: order.merchant.walletAddress,
      amount: formatCrypto(order.amount),
      link: this.operationManagementService.isUserBlocked(order.merchant) ? '' : `${this.subOperationsLink}/merchant/orders?status=cancelled`,
      ...(!this.operationManagementService.isUserBlocked(order.merchant) && { merchantId: order.merchantId }),
      ...(this.operationManagementService.isUserBlocked(order.merchant) && { merchantManagerId: order.merchant?.merchantManagerId }),
      username: order.user.nickName,
      datetime: order.appeal.createdAt,
    });
  }

  private async handleReopenBuyAppealUserWin(payload: { order: Order }) {
    const { order } = payload;
    await this.notificationService.createNotification({
      notificationCase: NOTIFICATION_TYPE.BUY_ORDER_RESULT_APPEAL_USER_WIN_REOPEN_BUY_ORDER_TO_USER,
      transactionId: order.id,
      transactionRefId: order.refId,
      transactionType: order.type,
      amount: formatCrypto(order.amount),
      currency: order.asset.name,
      type: NotificationType.TRANSACTION,
      walletAddress: order.user.walletAddress,
      endUserId: order.user.id,
      username: order.merchant.merchantManager.nickName,
      datetime: order.appeal.createdAt,
    });
    await this.notificationService.createNotification({
      notificationCase: NOTIFICATION_TYPE.BUY_ORDER_RESULT_APPEAL_USER_WIN_REOPEN_BUY_ORDER_TO_MERCHANT,
      transactionId: order.id,
      transactionRefId: order.refId,
      transactionType: order.type,
      currency: order.asset.name,
      type: NotificationType.TRANSACTION,
      walletAddress: order.merchant.walletAddress,
      amount: formatCrypto(order.amount),
      link: this.operationManagementService.isUserBlocked(order.merchant)
        ? `${this.subOperationsLink}/merchant-manager/staffs/${order.merchantId}/orders?status=appeal`
        : `${this.subOperationsLink}/merchant/orders?status=appeal`,
      ...(!this.operationManagementService.isUserBlocked(order.merchant) && { merchantId: order.merchantId }),
      ...(this.operationManagementService.isUserBlocked(order.merchant) && { merchantManagerId: order.merchant?.merchantManagerId }),
      username: order.user.nickName,
      datetime: order.appeal.createdAt,
    });
  }

  private async handleMerchantWinBuyAppeal(payload: { order: Order }) {
    const { order } = payload;
    if (order.supporterId) {
      await this.notificationService.createNotification({
        notificationCase: NOTIFICATION_TYPE.ADMIN_NOTIFY_MERCHANT_SUPPORTER_ORDER_IS_CANCELED,
        orderIds: [order.refId],
        type: NotificationType.TRANSACTION,
        merchantSupporterId: order.supporterId,
      });
    }
    await this.notificationService.createNotification({
      notificationCase: NOTIFICATION_TYPE.BUY_ORDER_RESULT_APPEAL_MERCHANT_WIN_TO_USER,
      transactionId: order.id,
      transactionRefId: order.refId,
      transactionType: order.type,
      amount: formatCrypto(order.amount),
      currency: order.asset.name,
      type: NotificationType.TRANSACTION,
      walletAddress: order.user.walletAddress,
      endUserId: order.user.id,
      username: order.merchant.merchantManager.nickName,
      datetime: order.appeal.createdAt,
    });
    await this.notificationService.createNotification({
      notificationCase: NOTIFICATION_TYPE.BUY_ORDER_RESULT_APPEAL_MERCHANT_WIN_TO_MERCHANT,
      transactionId: order.id,
      transactionRefId: order.refId,
      transactionType: order.type,
      currency: order.asset.name,
      type: NotificationType.TRANSACTION,
      walletAddress: order.merchant.walletAddress,
      amount: formatCrypto(order.amount),
      link: this.operationManagementService.isUserBlocked(order.merchant) ? '' : `${this.subOperationsLink}/merchant/orders?status=cancelled`,
      ...(!this.operationManagementService.isUserBlocked(order.merchant) && { merchantId: order.merchantId }),
      ...(this.operationManagementService.isUserBlocked(order.merchant) && { merchantManagerId: order.merchant?.merchantManagerId }),
      username: order.user.nickName,
      datetime: order.appeal.createdAt,
    });
  }

  private async handleUserCreateSellAppeal(payload: { order: Order }) {
    const { order } = payload;
    await this.notificationService.createNotification({
      notificationCase: NOTIFICATION_TYPE.SELL_ORDER_USER_APPEAL_TO_MERCHANT,
      transactionId: order.id,
      transactionRefId: order.refId,
      transactionType: order.type,
      currency: order.asset.name,
      type: NotificationType.TRANSACTION,
      walletAddress: order.merchant.walletAddress,
      username: order.user.nickName,
      datetime: order.appeal.createdAt,
      amount: formatCrypto(order.amount),
      link: this.operationManagementService.isUserBlocked(order.merchant)
        ? `${this.subOperationsLink}/merchant-manager/staffs/${order.merchantId}/orders?status=appeal`
        : `${this.subOperationsLink}/merchant/orders?status=appeal`,
      ...(!this.operationManagementService.isUserBlocked(order.merchant) && { merchantId: order.merchantId }),
      ...(this.operationManagementService.isUserBlocked(order.merchant) && { merchantManagerId: order.merchant?.merchantManagerId }),
    });
  }

  private async handleExtendExtraTimeSellAppeal(appeal: Appeal) {
    const order = appeal.order;
    await this.notificationService.createNotification({
      notificationCase: NOTIFICATION_TYPE.SELL_ORDER_DEAL_TIME,
      transactionId: order.id,
      transactionRefId: order.refId,
      transactionType: order.type,
      username: order.user.nickName,
      currency: order.asset.name,
      datetime: appeal.completedAt,
      type: NotificationType.TRANSACTION,
      walletAddress: order.merchant.walletAddress,
      amount: formatCrypto(order.amount),
      link: this.operationManagementService.isUserBlocked(order.merchant)
        ? `${this.subOperationsLink}/merchant-manager/staffs/${order.merchantId}/orders?status=appeal`
        : `${this.subOperationsLink}/merchant/orders?status=appeal`,
      ...(!this.operationManagementService.isUserBlocked(order.merchant) && { merchantId: order.merchantId }),
      ...(this.operationManagementService.isUserBlocked(order.merchant) && { merchantManagerId: order.merchant?.merchantManagerId }),
    });
    await this.notificationService.createNotification({
      notificationCase: NOTIFICATION_TYPE.SELL_ORDER_DEAL_TIME,
      transactionId: order.id,
      transactionRefId: order.refId,
      transactionType: order.type,
      username: order.user.nickName,
      amount: formatCrypto(order.amount),
      currency: order.asset.name,
      datetime: appeal.completedAt,
      type: NotificationType.TRANSACTION,
      walletAddress: order.user.walletAddress,
      endUserId: order.user.id,
    });
    const orderResponse = new OrderInfoBaseResponse(order);
    orderResponse.appeal = new AppealResponse(appeal, appeal.order.type);
    const room = [
      order.user.walletAddress,
      this.operationManagementService.isUserBlocked(order.merchant) ? order.merchant.merchantManager.walletAddress : order.merchant.walletAddress,
    ];
    if (order.supporter) {
      room.push(order.supporter.walletAddress);
    } else {
      const supporters = await this.operationManagementService.findAllSupportersByManagerId(order.merchant.merchantManagerId);
      const supporterWallets = supporters.map(e => e.walletAddress);
      room.push(...supporterWallets);
    }
    this.socketFactory.emitToRoom(room, {
      order: orderResponse,
      event: events.objects.appeal,
      action: events.actions.appeal.extraTimeSellAppeal,
    });
  }

  private async handleCloseAppeal(payload: { appealId: string }) {
    const { appealId } = payload;
    const admins = await this.operationManagementService.findAllAdmins();
    const room = admins.map((admin) => admin.walletAddress);
    this.socketFactory.emitToRoom(room, {
      appealId,
      event: events.objects.appeal,
      action: events.actions.appeal.closeAppeal,
    });
  }

  private async handleAdminSupporterPickAppeal(payload: { adminSupporter: string, orderRefId: string }) {
    const superAdmins = await this.operationManagementService.findAllAdmins([OperationType.SUPER_ADMIN]);
    for (const admin of superAdmins) {
      this.notificationService.createNotification({
        notificationCase: NOTIFICATION_TYPE.ADMIN_SUPPORTER_PICK_APPEAL,
        username: payload.adminSupporter,
        type: NotificationType.SYSTEM,
        adminId: admin.id,
        transactionRefId: payload.orderRefId,
      });
    }
  }

  private async handleCancelAppealSession(payload: { appealId: string, adminId: string, orderId: string }) {
    const { appealId, adminId, orderId } = payload;
    const admin = await this.operationManagementService.getOperationById(adminId);
    if (!admin) {
      return;
    }
    await this.notificationService.createNotification({
      notificationCase: NOTIFICATION_TYPE.ADMIN_CANCEL_SESSION_APPEAL,
      transactionRefId: orderId,
      type: NotificationType.TRANSACTION,
      adminId,
      link: '/appeals',
    });
    this.socketFactory.emitToRoom(admin.walletAddress, {
      appealId,
      event: events.objects.appeal,
      action: events.actions.appeal.adminCancelAppealSession,
    });
  }

  private async handleCreateNewSupportRequest(userName: string) {
    const admins = await this.operationManagementService.findAllAdmins([OperationType.SUPER_ADMIN, OperationType.ADMIN_SUPPORTER]);
    const rooms = [];
    const notificationPromies = admins.map((admin) => {
      rooms.push(admin.walletAddress);
      return this.notificationService.createNotification({
        notificationCase: admin.type === OperationType.ADMIN_SUPPORTER
          ? NOTIFICATION_TYPE.USER_REQUEST_SUPPORT_TO_ADMIN_SUPPORT
          : NOTIFICATION_TYPE.USER_REQUEST_SUPPORT_TO_SUPPER_ADMIN,
        username: userName,
        adminId: admin.id,
        walletAddress: admin.walletAddress,
        type: NotificationType.SYSTEM,
      });
    });
    await Promise.allSettled(notificationPromies);
    this.socketFactory.emitToRoom(rooms, {
      userName,
      event: events.objects.supportRequest,
      action: events.actions.supportRequest.createNewSupportRequest,
    });
  }

  private async handlePickSupportRequest(supportRequestId: string) {
    const admins = await this.operationManagementService.findAllAdmins([OperationType.SUPER_ADMIN, OperationType.ADMIN_SUPPORTER]);
    const rooms = admins.map((admin) => admin.walletAddress);
    this.socketFactory.emitToRoom(rooms, {
      supportRequestId,
      event: events.objects.supportRequest,
      action: events.actions.supportRequest.supportRequestPicked,
    });
  }

  private async resolvedSupportRequest(user: User) {
    this.socketFactory.emitToRoom(user?.walletAddress, {
      event: events.objects.supportRequest,
      action: events.actions.supportRequest.resolvedSupportRequest,
    });
  }

  private async handleCloseAppealSellOrder(payload: { order: Order }) {
    const { order } = payload;
    if (order.supporterId) {
      await this.notificationService.createNotification({
        notificationCase: NOTIFICATION_TYPE.ADMIN_NOTIFY_MERCHANT_SUPPORTER_ORDER_IS_CANCELED,
        orderIds: [order.refId],
        type: NotificationType.TRANSACTION,
        merchantSupporterId: order.supporterId,
      });
    }
    await this.notificationService.createNotification({
      notificationCase: NOTIFICATION_TYPE.SELL_ORDER_CLOSE_APPEAL_MERCHANT_REFUNDED_TO_USER,
      transactionId: order.id,
      transactionRefId: order.refId,
      transactionType: order.type,
      username: order.merchant.merchantManager.nickName,
      amount: formatCrypto(order.amount),
      currency: order.asset.name,
      datetime: order.appeal.createdAt,
      type: NotificationType.TRANSACTION,
      walletAddress: order.user.walletAddress,
      endUserId: order.user.id,
    });
    await this.notificationService.createNotification({
      notificationCase: NOTIFICATION_TYPE.SELL_ORDER_CLOSE_APPEAL_MERCHANT_REFUNDED_TO_MERCHANT,
      transactionId: order.id,
      transactionRefId: order.refId,
      transactionType: order.type,
      username: order.user.nickName,
      currency: order.asset.name,
      datetime: order.appeal.createdAt,
      type: NotificationType.TRANSACTION,
      walletAddress: order.merchant.walletAddress,
      amount: formatCrypto(order.amount),
      link: this.operationManagementService.isUserBlocked(order.merchant) ? '' : `${this.subOperationsLink}/merchant/orders?status=cancelled`,
      ...(!this.operationManagementService.isUserBlocked(order.merchant) && { merchantId: order.merchantId }),
      ...(this.operationManagementService.isUserBlocked(order.merchant) && { merchantManagerId: order.merchant?.merchantManagerId }),
    });
  }

  private async handleMerchantWinSellAppeal(payload: { order: Order }) {
    const { order } = payload;
    // Due to business, unlink supporter from order when fullfill.
    if (order.supporterId) {
      this.notificationService.createNotification({
        notificationCase: NOTIFICATION_TYPE.ADMIN_NOTIFY_MERCHANT_SUPPORTER_ORDER_IS_COMPLETED,
        orderIds: [order.refId],
        type: NotificationType.TRANSACTION,
        merchantSupporterId: order.supporterId,
      });
    }
    await this.notificationService.createNotification({
      notificationCase: NOTIFICATION_TYPE.SELL_ORDER_RESULT_APPEAL_MERCHANT_WIN_TO_USER,
      transactionId: order.id,
      transactionRefId: order.refId,
      transactionType: order.type,
      username: order.merchant.merchantManager.nickName,
      amount: formatCrypto(order.amount),
      currency: order.asset.name,
      datetime: order.appeal.createdAt,
      type: NotificationType.TRANSACTION,
      walletAddress: order.user.walletAddress,
      endUserId: order.user.id,
    });

    await this.notificationService.createNotification({
      notificationCase: NOTIFICATION_TYPE.SELL_ORDER_RESULT_APPEAL_MERCHANT_WIN_TO_MERCHANT,
      transactionId: order.id,
      transactionRefId: order.refId,
      transactionType: order.type,
      username: order.user.nickName,
      currency: order.asset.name,
      datetime: order.appeal.createdAt,
      type: NotificationType.TRANSACTION,
      walletAddress: order.merchant.walletAddress,
      amount: formatCrypto(order.amount),
      link: this.operationManagementService.isUserBlocked(order.merchant) ? '' : `${this.subOperationsLink}/merchant/orders?status=completed`,
      ...(!this.operationManagementService.isUserBlocked(order.merchant) && { merchantId: order.merchantId }),
      ...(this.operationManagementService.isUserBlocked(order.merchant) && { merchantManagerId: order.merchant?.merchantManagerId }),
    });
  }

  private async handleUserWinAppealSellOrder(payload: { order: Order }) {
    const { order } = payload;
    // Due to business, unlink supporter from order when fullfill.
    if (order.supporterId) {
      await this.notificationService.createNotification({
        notificationCase: NOTIFICATION_TYPE.ADMIN_NOTIFY_MERCHANT_SUPPORTER_ORDER_IS_CANCELED,
        orderIds: [order.refId],
        type: NotificationType.TRANSACTION,
        merchantSupporterId: order.supporterId,
      });
    }
    await this.notificationService.createNotification({
      notificationCase: NOTIFICATION_TYPE.SELL_ORDER_RESULT_APPEAL_USER_WIN_REFUND_TO_USER,
      transactionId: order.id,
      transactionRefId: order.refId,
      transactionType: order.type,
      username: order.user.nickName,
      amount: formatCrypto(order.amount),
      currency: order.asset.name,
      datetime: order.appeal.createdAt,
      type: NotificationType.TRANSACTION,
      walletAddress: order.user.walletAddress,
      endUserId: order.user.id,
    });
    await this.notificationService.createNotification({
      notificationCase: NOTIFICATION_TYPE.SELL_ORDER_RESULT_APPEAL_USER_WIN_REFUND_TO_MERCHANT,
      transactionId: order.id,
      transactionRefId: order.refId,
      transactionType: order.type,
      username: order.user.nickName,
      currency: order.asset.name,
      datetime: order.appeal.createdAt,
      type: NotificationType.TRANSACTION,
      walletAddress: order.merchant.walletAddress,
      amount: formatCrypto(order.amount),
      link: this.operationManagementService.isUserBlocked(order.merchant) ? '' : `${this.subOperationsLink}/merchant/orders?status=cancelled`,
      ...(!this.operationManagementService.isUserBlocked(order.merchant) && { merchantId: order.merchantId }),
      ...(this.operationManagementService.isUserBlocked(order.merchant) && { merchantManagerId: order.merchant?.merchantManagerId }),
    });
  }

  private getNotificationCaseByOrder(order: Order, operation: Operation) {
    if (order.type === TradeType.BUY) {
      return operation.type === OperationType.MERCHANT_OPERATOR
        ? NOTIFICATION_TYPE.BUY_ORDER_USER_AGREE_TO_MERCHANT_SEND_TO_OPERATOR
        : NOTIFICATION_TYPE.BUY_ORDER_USER_AGREE_TO_MERCHANT_SEND_TO_SUPPORTER;
    }
   return operation.type === OperationType.MERCHANT_OPERATOR
     ? NOTIFICATION_TYPE.SELL_ORDER_USER_AGREE_TO_MERCHANT_SEND_TO_OPERATOR
     : NOTIFICATION_TYPE.SELL_ORDER_USER_AGREE_TO_MERCHANT_SEND_TO_SUPPORTER;
  }

  private convertStatusToQueryLink(status: string) {
    let statusLink = 'appeal';
    switch (status) {
      case 'WAITING':
        statusLink = 'pending-progress';
        break;
      case 'WAITING_USER':
        statusLink = 'pending-user-confirm';
        break;
      case 'APPEAL':
        statusLink = 'appeal';
        break;
      case 'SUCCESS':
        statusLink = 'completed';
        break;
      case 'CANCEL':
        statusLink = 'cancelled';
        break;
      default:
        break;
    }
    return statusLink;
  }

  private getWorkerOpts() {
    return {
      ...this.bullConfig,
      lockDuration: 90000,
      concurrency: 200,
    };
  }
}
