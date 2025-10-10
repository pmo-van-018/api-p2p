import { Member } from '@api/profile/types/User';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import { NotificationService } from '@api/notification/services/NotificationService';
import { UpdateNotificationBodyRequest } from '@api/notification/requests/UpdateNotificationBodyRequest';
import { P2PError } from '@api/common/errors/P2PError';
import { NotificationError } from '@api/notification/errors/NotificationError';

@Service()
export class UpdateNotificationStatusUseCase {
  constructor(
    private notificationService: NotificationService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async updateStatus(
    currentUser: Member,
    updateNotificationBodyRequest: UpdateNotificationBodyRequest,
    id: string
  ) {
    this.log.debug(`Start implement update status notification for: ${currentUser.id} and roles: ${currentUser.type}`);
    const notification = await this.notificationService.getNotificationById(id, currentUser);
    if (!notification) {
      throw new P2PError(NotificationError.NOTIFICATION_NOT_FOUND);
    }
    await this.notificationService.updateStatus(notification.id, currentUser, updateNotificationBodyRequest.status);
    this.log.debug(`Stop implement update status notification for: ${currentUser.id} and roles: ${currentUser.type}`);
  }
}
