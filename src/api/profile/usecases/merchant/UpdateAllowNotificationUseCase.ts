import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { NotificationType } from '@api/common/models';
import { MerchantProfileService } from '@api/profile/services/MerchantProfileService';

@Service()
export class UpdateAllowNotificationUseCase {
  constructor(
    private merchantProfileService: MerchantProfileService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async updateAllowNotification(userId: string, allowNotification: NotificationType[]) {
    this.log.debug(`Start implement updateAllowNotification: ${userId}`);
    await this.merchantProfileService.updateAllowNotification(userId, allowNotification);
    this.log.debug(`Stop implement updateAllowNotification: ${userId}`);
  }
}
