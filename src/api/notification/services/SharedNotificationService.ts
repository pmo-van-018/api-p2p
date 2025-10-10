import { NOTIFICATION_TYPE, NotificationType, OperationType, UserType } from '@api/common/models/P2PEnum';
import { Notification } from '@api/notification/models/Notification';
import { NotificationUser } from '@api/notification/models/NotificationUser';
import { NotificationRepository } from '@api/notification/repositories/NotificationRepository';
import { NotificationUserRepository } from '@api/notification/repositories/NotificationUserRepository';
import { NotificationMessage } from '@api/notification/types/Notification';
import { SharedProfileService } from '@api/profile/services/SharedProfileService';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { captialize } from '@base/utils/string.utils';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { PushNotificationService } from './PushNotificationService';
import { BuildNotificationContentService } from '@api/notification/services/BuildNotificationContentService';

@Service()
export class SharedNotificationService {
  constructor(
    @InjectRepository() private notificationRepository: NotificationRepository,
    @InjectRepository() private notificationUserRepository: NotificationUserRepository,
    private sharedProfileService: SharedProfileService,
    private pushNotificationService: PushNotificationService,
    private buildNotificationContentService: BuildNotificationContentService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async createNotification(data: NotificationMessage, options?: { onlyInternal?: boolean }) {
    this.log.debug(`Start implement createNotification for: ${JSON.stringify(data)}`);
    const {
      notificationCase,
      transactionId,
      transactionRefId,
      transactionType,
      username,
      amount,
      currency,
      datetime,
      bankName,
      walletAddress,
      endUserId,
      adminId,
      merchantId,
      merchantSupporterId,
      merchantManagerId,
      orderIds,
      appealId,
      link,
      merchantWalletAddress,
      merchantManagerWalletAddress,
      type,
      transactionIds,
      assetNetworks,
      operatorName,
      oldWalletAddress,
      newWalletAddress,
      managerProfileId,
      newValue,
      oldValue,
      assetBalances,
    } = data;

    let info;
    if (endUserId) {
      info = await this.sharedProfileService.getUserById(endUserId);
    } else {
      info = await this.sharedProfileService.getOperationById(
        adminId || merchantId || merchantManagerId || merchantSupporterId
      );
    }
    const canNotify =
      info && (info.allowNotification?.includes(NotificationType.ALL) || info.allowNotification?.includes(type));
    if (!canNotify) {
      return;
    }
    const {
      title,
      description,
      link: linkRef,
      roles,
    } = this.buildNotificationContentService.getNotificationMessage({
      notificationCase,
      transactionId,
      transactionType,
      username: username || '',
      amount,
      currency,
      datetime,
      bankName: captialize(bankName),
      walletAddress,
      endUserId,
      merchantId,
      merchantSupporterId,
      orderIds,
      merchantWalletAddress,
      merchantManagerWalletAddress,
      type,
      appealId,
      link,
      transactionIds,
      transactionRefId,
      assetNetworks,
      operatorName,
      oldWalletAddress,
      newWalletAddress,
      managerProfileId,
      newValue,
      oldValue,
      assetBalances,
    });
    const notification = new Notification();
    notification.title = title;
    notification.description = description;
    notification.type = data.type;
    notification.link = linkRef || '/notification?tab=all';
    const results = await this.notificationRepository.save(notification);
    await this.handleNotificationUser(results, data, roles, options);
    this.log.debug(`Stop implement createNotification for: ${JSON.stringify(data)}`);
  }

  public async handleNotificationUser(
    notification: Notification,
    data: NotificationMessage,
    roles: number[],
    options?: { onlyInternal?: boolean }
  ) {
    this.log.debug(`Start implement handleNotificationUser for: ${JSON.stringify(data)} and roles: ${roles}`);
    const users = [];
    if (data.endUserId && roles.includes(UserType.USER)) {
      users.push(this.handleCreateNotificationRecord(notification, data.endUserId, UserType.USER));
    }
    if (data.merchantId && roles.includes(OperationType.MERCHANT_OPERATOR)) {
      users.push(this.handleCreateNotificationRecord(notification, data.merchantId, OperationType.MERCHANT_OPERATOR));
    }
    if (data.merchantSupporterId && roles.includes(OperationType.MERCHANT_SUPPORTER)) {
      users.push(
        this.handleCreateNotificationRecord(notification, data.merchantSupporterId, OperationType.MERCHANT_SUPPORTER)
      );
    }
    if (data.merchantManagerId && roles.includes(OperationType.MERCHANT_MANAGER)) {
      users.push(
        this.handleCreateNotificationRecord(notification, data.merchantManagerId, OperationType.MERCHANT_MANAGER)
      );
    }

    if (data.adminId && roles.includes(OperationType.SUPER_ADMIN)) {
      users.push(this.handleCreateNotificationRecord(notification, data.adminId, OperationType.SUPER_ADMIN));
    } else if (data.adminId && roles.includes(OperationType.ADMIN_SUPPORTER)) {
      users.push(this.handleCreateNotificationRecord(notification, data.adminId, OperationType.ADMIN_SUPPORTER));
    }

    await this.notificationUserRepository.save(users);
    if (options?.onlyInternal) {
      return;
    }
    users.map((item) => {
      if (
        data.oldWalletAddress &&
        data.notificationCase === NOTIFICATION_TYPE.ADMIN_ACTIVE_WALLET_ADDRESS_TO_MERCHANT
      ) {
        this.pushNotificationService.sendNotificationToManagerSwapWalletAddress(notification, data.oldWalletAddress);
      } else {
        this.pushNotificationService.pushNotification(item, notification, roles);
      }
    });
    this.log.debug(`Stop implement handleNotificationUser for: ${JSON.stringify(data)} and roles: ${roles}`);
  }

  private handleCreateNotificationRecord(notification: Notification, userId: string, userType: number) {
    const notificationUser = new NotificationUser();
    if (userType === UserType.USER) {
      notificationUser.userId = userId;
    } else {
      notificationUser.operationId = userId;
    }
    notificationUser.notificationId = notification.id;
    return notificationUser;
  }
}
