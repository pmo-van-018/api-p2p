import { Member } from '@api/profile/types/User';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Service } from 'typedi';
import { NotificationService } from '@api/notification/services/NotificationService';
import { NotificationStatus } from '@api/common/models';

@Service()
export class ReadAllNotificationUseCase {
  constructor(
    private notificationService: NotificationService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async readAll(currentUser: Member) {
    this.log.debug(`Start implement markReadAllNotifications for: ${currentUser.id} and roles: ${currentUser.type}`);
    await this.notificationService.updateStatusAll(currentUser, NotificationStatus.READ);
    this.log.debug(`Stop implement markReadAllNotifications for: ${currentUser.id} and roles: ${currentUser.type}`);
  }
}
