import { Member } from '@api/profile/types/User';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import { NotificationService } from '@api/notification/services/NotificationService';
import { NotificationType } from '@api/common/models';
import { PaginationUtil } from '@base/utils/pagination.util';
import { NotificationListRequest } from '@api/notification/requests/NotificationListRequest';

@Service()
export class GetNotificationUseCase {
  constructor(
    private notificationService: NotificationService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getNotifications(user: Member, notificationListRequest: NotificationListRequest) {
    this.log.debug(`Start implement showNotificationByUserId for: ${user.id} and roles: ${user.type}`);
    const results = await this.notificationService.getNotificationListByUserId(user, notificationListRequest);
    const unreadByType = await this.notificationService.countNotificationByType(user);
    const totalUnread = unreadByType.reduce((itemSum, item) => itemSum + Number(item.total), 0);
    const transactionUnread = Number(
      unreadByType.find((item) => item.type === NotificationType.TRANSACTION)?.total || 0
    );
    const systemUnread = Number(unreadByType.find((item) => item.type === NotificationType.SYSTEM)?.total || 0);
    const data = PaginationUtil.paginateNotification(
      {
        ...results,
        totalUnread,
        systemUnread,
        transactionUnread,
      },
      {
        limit: notificationListRequest.limit,
        page: notificationListRequest.page,
      }
    );
    this.log.debug(`Stop implement showNotificationByUserId for: ${user.id} and roles: ${user.type}`);
    return {
      ...data,
      totalUnread,
      systemUnread,
      transactionUnread,
    };
  }
}
