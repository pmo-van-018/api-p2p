import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { UserProfileService } from '@api/profile/services/UserProfileService';
import { NotificationType } from '@api/common/models';

@Service()
export class UpdateAllowNotificationUseCase {
  constructor(
    private userProfileService: UserProfileService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async updateAllowNotification(userId: string, allowNotification: NotificationType[]) {
    this.log.debug(`Start implement updateAllowNotification: ${userId}`);
    await this.userProfileService.updateAllowNotification(userId, allowNotification);
    this.log.debug(`Stop implement updateAllowNotification: ${userId}`);
  }
}
