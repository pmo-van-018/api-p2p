import { EventSubscriber, On } from 'event-dispatch';

import { NOTIFICATION_TYPE, NotificationType, OperationType } from '@api/common/models/P2PEnum';
import { SharedNotificationService } from '@api/notification/services/SharedNotificationService';
import { OrderStatus } from '@api/order/models/Order';
import { SharedOrderService } from '@api/order/services/order/SharedOrderService';
import { Operation } from '@api/profile/models/Operation';
import Container from 'typedi';
import { events } from './events';
import { NotificationMessage } from '@api/notification/types/Notification';
import { SharedStatisticService } from '@api/statistic/services/SharedStatisticService';
import { SharedProfileService } from '@api/profile/services/SharedProfileService';
import { SessionUtil } from '@base/utils/session.util';

@EventSubscriber()
export class UserEventSubscriber {
  private notificationService: SharedNotificationService;
  private statisticService: SharedStatisticService;
  private profileService: SharedProfileService;
  private orderService: SharedOrderService;

  constructor() {
    this.notificationService = Container.get<SharedNotificationService>(SharedNotificationService);
    this.statisticService = Container.get<SharedStatisticService>(SharedStatisticService);
    this.orderService = Container.get<SharedOrderService>(SharedOrderService);
    this.profileService = Container.get<SharedProfileService>(SharedProfileService);
  }
  @On(events.actions.user.created)
  public async onUserCreate(user: Operation): Promise<void> {
    const statisticId = await this.statisticService.createByUserId(user.id);
    await this.profileService.updateByUserId(user.id, { statisticId });
  }

  @On(events.actions.operator.deactivatedFromAdmin)
  public async onDeactiveMerchantOperatorFromAdmin(payload: { staff: Operation }): Promise<void> {
    const { staff } = payload;
    SessionUtil.destroy(staff.id);
    const orderIds = await this.orderService.getOrderIds(payload.staff.id, OrderStatus.TO_BE_PAID).then((data) => data.map((order) => order.refId));
    if (orderIds.length) {
      this.notificationService.createNotification(
        {
          notificationCase: NOTIFICATION_TYPE.ADMIN_DISABLE_MERCHANT_OPERATOR_HAS_PENDING_ORDER,
          username: staff.nickName,
          walletAddress: staff.walletAddress,
          merchantManagerId: staff.merchantManagerId,
          orderIds,
          type: NotificationType.SYSTEM,
        },
        { onlyInternal: true }
      );
    } else {
      this.notificationService.createNotification(
        {
          notificationCase: NOTIFICATION_TYPE.ADMIN_DISABLE_MERCHANT_OPERATOR,
          username: staff.nickName,
          walletAddress: staff.walletAddress,
          merchantManagerId: staff.merchantManagerId,
          type: NotificationType.SYSTEM,
        },
        { onlyInternal: true }
      );
    }
  }

  @On(events.actions.operator.activatedSupporterFromAdmin)
  public async onActiveAdminSupporterFromSuperAdmin(payload: Operation): Promise<void> {
    this.notificationService.createNotification({
      notificationCase: NOTIFICATION_TYPE.ADMIN_ACTIVE_ADMIN_SUPPORTER,
      username: payload.nickName,
      walletAddress: payload.walletAddress,
      type: NotificationType.SYSTEM,
      adminId: payload.id,
    });
  }

  @On(events.actions.supporter.deactivatedFromAdmin)
  public async onDeactiveMerchantSupporterFromAdmin(payload: { staff: Operation }): Promise<void> {
    const { staff } = payload;
    SessionUtil.destroy(staff.id);
    this.notificationService.createNotification(
      {
        notificationCase: NOTIFICATION_TYPE.ADMIN_DISABLE_MERCHANT_SUPPORTER,
        username: staff.nickName,
        walletAddress: staff.walletAddress,
        merchantManagerId: staff.merchantManagerId,
        type: NotificationType.SYSTEM,
      },
      { onlyInternal: true }
    );
  }

  @On(events.actions.operator.activatedFromManager)
  public async onActiveMerchantOperatorFromManager(payload: { staff: Operation }): Promise<void> {
    const { staff } = payload;
    this.notificationService.createNotification({
      notificationCase: NOTIFICATION_TYPE.MANAGER_NOTIFY_ENABLE_MERCHANT_OPERATOR_TO_OPERATOR,
      username: staff.nickName,
      merchantId: staff.id,
      walletAddress: staff.walletAddress,
      type: NotificationType.SYSTEM,
    });
  }

  @On(events.actions.supporter.activatedFromManager)
  public async onActiveMerchantSupporterFromManager(payload: { staff: Operation }): Promise<void> {
    const { staff } = payload;
    this.notificationService.createNotification({
      notificationCase: NOTIFICATION_TYPE.MANAGER_NOTIFY_ENABLE_MERCHANT_SUPPORTER_TO_SUPPORTER,
      username: staff.nickName,
      merchantId: staff.id,
      walletAddress: staff.walletAddress,
      type: NotificationType.SYSTEM,
      merchantSupporterId: staff.id,
    });
  }

  @On(events.actions.operator.onlinePostByManager)
  public async onOnlinePostByManager(payload: { staff: Operation; refId: string }): Promise<void> {
    const { staff, refId } = payload;
    this.notificationService.createNotification({
      notificationCase: NOTIFICATION_TYPE.MANAGER_CHANGED_POST_STATUS_TO_ONLINE,
      username: staff.nickName,
      merchantId: staff.id,
      walletAddress: staff.walletAddress,
      type: NotificationType.SYSTEM,
      transactionId: refId,
    });
  }

  @On(events.actions.operator.offlinePostByManager)
  public async onOfflinePostByManager(payload: { staff: Operation; refId: string }): Promise<void> {
    const { staff, refId } = payload;
    this.notificationService.createNotification({
      notificationCase: NOTIFICATION_TYPE.MANAGER_CHANGED_POST_STATUS_TO_OFFLINE,
      username: staff.nickName,
      merchantId: staff.id,
      walletAddress: staff.walletAddress,
      type: NotificationType.SYSTEM,
      transactionId: refId,
    });
  }

  @On(events.actions.user.activeManager)
  public async onActiveMerchantManager(merchantManager: Operation): Promise<void> {
    await this.notificationService.createNotification({
      notificationCase: NOTIFICATION_TYPE.ADMIN_ENABLE_MERCHANT_MANAGER_TO_MANAGER,
      username: merchantManager.nickName,
      merchantManagerId: merchantManager.id,
      walletAddress: merchantManager.walletAddress,
      type: NotificationType.SYSTEM,
    });
    merchantManager.merchantOperators.forEach((merchantOperator) => {
      this.notificationService.createNotification({
        notificationCase: NOTIFICATION_TYPE.ADMIN_ENABLE_MERCHANT_MANAGER_TO_MERCHANT,
        username: merchantOperator.nickName,
        merchantId: merchantOperator.id,
        walletAddress: merchantOperator.walletAddress,
        merchantManagerWalletAddress: merchantOperator.walletAddress,
        type: NotificationType.SYSTEM,
      });
    });
  }

  @On(events.actions.operation.onSwapWalletAddressByManager)
  public async onSwapWalletAddressByManager(payload: {
    currentUser: Operation;
    newWalletAddress: string;
  }): Promise<void> {
    const { currentUser, newWalletAddress } = payload;
    const [admins, staffs] = await Promise.all([
      this.profileService.findAllAdmins([OperationType.SUPER_ADMIN]),
      this.profileService.findAllStaffsByManagerId(currentUser.id),
    ]);
    await Promise.all(
      admins.map((admin) => {
        return this.notificationService.createNotification({
          notificationCase: NOTIFICATION_TYPE.MANAGER_ACTIVE_WALLET_ADDRESS_TO_ADMIN,
          operatorName: currentUser.nickName,
          oldWalletAddress: currentUser.walletAddress,
          newWalletAddress,
          adminId: admin.id,
          type: NotificationType.SYSTEM,
          managerProfileId: currentUser.id,
        });
      })
    );
    await Promise.all(
      staffs.map((staff) => {
        const notification: NotificationMessage = {
          notificationCase: NOTIFICATION_TYPE.MANAGER_ACTIVE_WALLET_ADDRESS_TO_STAFF,
          oldWalletAddress: currentUser.walletAddress,
          newWalletAddress,
          type: NotificationType.SYSTEM,
        };
        staff.type === OperationType.MERCHANT_OPERATOR
          ? (notification.merchantId = staff.id)
          : (notification.merchantSupporterId = staff.id);
        return this.notificationService.createNotification(notification);
      })
    );
  }

  @On(events.actions.operation.onSwapWalletAddressByAdmin)
  public async onSwapWalletAddressByAdmin(payload: { manager: Operation; newWalletAddress: string }): Promise<void> {
    const { manager, newWalletAddress } = payload;
    const staffs = await this.profileService.findAllStaffsByManagerId(manager.id);
    await this.notificationService.createNotification({
      notificationCase: NOTIFICATION_TYPE.ADMIN_ACTIVE_WALLET_ADDRESS_TO_MERCHANT,
      operatorName: manager.nickName,
      oldWalletAddress: manager.walletAddress,
      newWalletAddress,
      merchantManagerId: manager.id,
      type: NotificationType.SYSTEM,
    });
    await Promise.all(
      staffs.map((staff) => {
        const notification: NotificationMessage = {
          notificationCase: NOTIFICATION_TYPE.MANAGER_ACTIVE_WALLET_ADDRESS_TO_STAFF,
          oldWalletAddress: manager.walletAddress,
          newWalletAddress,
          type: NotificationType.SYSTEM,
        };
        staff.type === OperationType.MERCHANT_OPERATOR
          ? (notification.merchantId = staff.id)
          : (notification.merchantSupporterId = staff.id);
        return this.notificationService.createNotification(notification);
      })
    );
  }
}
