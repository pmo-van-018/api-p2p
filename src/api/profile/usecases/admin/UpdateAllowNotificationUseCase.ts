import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { NotificationType } from '@api/common/models';
import { AdminProfileService } from '@api/profile/services/AdminProfileService';

@Service()
export class UpdateAllowNotificationUseCase {
  constructor(
    private adminProfileService: AdminProfileService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async updateAllowNotification(adminId: string, allowNotification: NotificationType[]) {
    this.log.debug(`Start implement updateAllowNotification: ${adminId} with params: ${JSON.stringify(allowNotification)}`);
    await this.adminProfileService.updateAllowNoti(adminId, allowNotification);
    this.log.debug(`Stop implement updateAllowNotification: ${adminId} with params: ${JSON.stringify(allowNotification)}`);
  }
}
