import { Member } from '@api/profile/types/User';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import { NotificationService } from '@api/notification/services/NotificationService';

@Service()
export class DeleteAllNotificationUseCase {
  constructor(
    private notificationService: NotificationService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async deleteAll(currentUser: Member) {
    this.log.debug(`Start implement deleteAllNotifications for: ${currentUser.id} and roles: ${currentUser.type}`);
    await this.notificationService.deleteAllNotificationUser(currentUser);
    this.log.debug(`Stop implement deleteAllNotifications for: ${currentUser.id} and roles: ${currentUser.type}`);
  }
}
